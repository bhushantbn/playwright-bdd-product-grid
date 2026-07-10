import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../config/ConfigManager';

export class BlobStorageManager {
  private containerClient: ContainerClient | null = null;
  private containerName: string;

  constructor() {
    const config = ConfigManager.getInstance().getConfig();
    const connectionString = config.azureStorage.connectionString;
    this.containerName = config.azureStorage.containerName;

    // Check if configuration is just a placeholder
    const isPlaceholder = 
      !connectionString || 
      connectionString.includes('youraccount') || 
      connectionString.includes('devaccount') ||
      connectionString === 'DefaultEndpointsProtocol=https;AccountName=devaccount;AccountKey=devkey;EndpointSuffix=core.windows.net';

    if (isPlaceholder) {
      console.warn('[BlobStorage] Azure Storage credentials are placeholders. Azure integrations will be skipped.');
      return;
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = blobServiceClient.getContainerClient(this.containerName);
    } catch (error) {
      console.error(`[BlobStorage] Failed to initialize Azure Blob Storage client: ${(error as Error).message}`);
    }
  }

  /**
   * Ensure that the target container exists.
   */
  private async ensureContainerExists(): Promise<boolean> {
    if (!this.containerClient) {
      return false;
    }
    try {
      const exists = await this.containerClient.exists();
      if (!exists) {
        console.log(`[BlobStorage] Container "${this.containerName}" does not exist. Creating it...`);
        await this.containerClient.create();
      }
      return true;
    } catch (error) {
      console.error(`[BlobStorage] Error checking/creating container: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Uploads a file to Azure Blob Storage.
   * @param localFilePath The local file path.
   * @param blobName Optional name for the blob. Defaults to the base name of the local file.
   */
  public async uploadFile(localFilePath: string, blobName?: string): Promise<string | null> {
    if (!this.containerClient) {
      console.warn(`[BlobStorage] Skipped uploading "${localFilePath}" (Azure Storage client not initialized).`);
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      console.error(`[BlobStorage] Local file does not exist: ${localFilePath}`);
      return null;
    }

    const nameOfBlob = blobName || path.basename(localFilePath);
    console.log(`[BlobStorage] Uploading "${localFilePath}" to blob "${nameOfBlob}" in container "${this.containerName}"...`);

    try {
      const initialized = await this.ensureContainerExists();
      if (!initialized) {
        return null;
      }

      const blockBlobClient = this.containerClient.getBlockBlobClient(nameOfBlob);
      const data = fs.readFileSync(localFilePath);
      
      const uploadResponse = await blockBlobClient.upload(data, data.length);
      console.log(`[BlobStorage] Upload successful. RequestId: ${uploadResponse.requestId}`);
      return blockBlobClient.url;
    } catch (error) {
      console.error(`[BlobStorage] Failed to upload file to Azure Blob Storage: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Downloads a blob to a local file path.
   * @param blobName The name of the blob in the container.
   * @param destinationPath The local target path to write the downloaded file.
   */
  public async downloadFile(blobName: string, destinationPath: string): Promise<boolean> {
    if (!this.containerClient) {
      console.warn(`[BlobStorage] Skipped downloading "${blobName}" (Azure Storage client not initialized).`);
      return false;
    }

    console.log(`[BlobStorage] Downloading blob "${blobName}" to "${destinationPath}"...`);

    try {
      const initialized = await this.ensureContainerExists();
      if (!initialized) {
        return false;
      }

      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      
      const dir = path.dirname(destinationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const readableStream = downloadBlockBlobResponse.readableStreamBody;
      if (!readableStream) {
        throw new Error('Readable stream is undefined.');
      }

      await new Promise<void>((resolve, reject) => {
        const fileStream = fs.createWriteStream(destinationPath);
        readableStream.pipe(fileStream);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      console.log(`[BlobStorage] Download completed successfully.`);
      return true;
    } catch (error) {
      console.error(`[BlobStorage] Failed to download blob from Azure: ${(error as Error).message}`);
      return false;
    }
  }
}

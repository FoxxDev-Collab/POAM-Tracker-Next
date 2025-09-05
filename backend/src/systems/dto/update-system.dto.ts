import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import {
  SystemOperatingSystem,
  SystemArchitecture,
  DataClassification,
  EncryptionStatus,
  AntivirusStatus,
  LifecycleStatus,
  EnvironmentType,
  SystemCriticality,
} from '@prisma/client';

export class UpdateSystemDto {
  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsString()
  subnetMask?: string;

  @IsOptional()
  @IsString()
  defaultGateway?: string;

  @IsOptional()
  @IsString()
  dnsServers?: string;

  @IsOptional()
  @IsEnum(SystemOperatingSystem)
  operatingSystem?: SystemOperatingSystem;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsEnum(SystemArchitecture)
  architecture?: SystemArchitecture;

  @IsOptional()
  @IsInt()
  cpuCores?: number;

  @IsOptional()
  @IsInt()
  ramGB?: number;

  @IsOptional()
  @IsInt()
  storageGB?: number;

  @IsOptional()
  @IsEnum(DataClassification)
  classification?: DataClassification;

  @IsOptional()
  @IsEnum(EncryptionStatus)
  encryptionStatus?: EncryptionStatus;

  @IsOptional()
  @IsString()
  patchLevel?: string;

  @IsOptional()
  @IsEnum(AntivirusStatus)
  antivirusStatus?: AntivirusStatus;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  warrantyExpiry?: string;

  @IsOptional()
  @IsEnum(LifecycleStatus)
  lifecycleStatus?: LifecycleStatus;

  @IsOptional()
  @IsString()
  eolDate?: string;

  @IsOptional()
  @IsString()
  replacementDate?: string;

  @IsOptional()
  @IsString()
  primaryContact?: string;

  @IsOptional()
  @IsString()
  backupContact?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  supportContract?: string;

  @IsOptional()
  @IsString()
  supportExpiry?: string;

  @IsOptional()
  @IsString()
  physicalLocation?: string;

  @IsOptional()
  @IsString()
  rackLocation?: string;

  @IsOptional()
  @IsString()
  datacenter?: string;

  @IsOptional()
  @IsEnum(EnvironmentType)
  environmentType?: EnvironmentType;

  @IsOptional()
  @IsString()
  businessFunction?: string;

  @IsOptional()
  @IsEnum(SystemCriticality)
  criticality?: SystemCriticality;

  @IsOptional()
  @IsString()
  backupSchedule?: string;

  @IsOptional()
  @IsString()
  maintenanceWindow?: string;

  @IsOptional()
  @IsString()
  lastInventoryDate?: string;

  @IsOptional()
  @IsString()
  complianceNotes?: string;
}

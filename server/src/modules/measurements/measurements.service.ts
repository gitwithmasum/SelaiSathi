import prisma from '../../config/database.js';
import {
  SaveMeasurementInput,
  CreateGarmentTypeInput,
} from './measurements.dto.js';

export class MeasurementsService {
  /**
   * Get all active Garment Types (System Defaults + Tailor's Custom Types).
   */
  async getGarmentTypes(tailorProfileId?: string) {
    return prisma.garmentType.findMany({
      where: {
        OR: [
          { tailorId: null }, // System presets
          ...(tailorProfileId ? [{ tailorId: tailorProfileId }] : []),
        ],
      },
      orderBy: [{ isDefault: 'desc' }, { nameBn: 'asc' }],
    });
  }

  /**
   * Create custom Garment Type for this shop.
   */
  async createCustomGarmentType(
    tailorProfileId: string,
    data: CreateGarmentTypeInput
  ) {
    return prisma.garmentType.create({
      data: {
        tailorId: tailorProfileId,
        nameBn: data.nameBn,
        nameEn: data.nameEn,
        icon: data.icon || 'custom',
        fields: data.fields,
        styleOptions: data.styleOptions || [],
        isDefault: false,
      },
    });
  }

  /**
   * Get all current measurements for a customer with this tailor.
   */
  async getCustomerMeasurements(tailorProfileId: string, customerId: string) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId,
        },
      },
    });

    if (!link) {
      throw new Error('কাস্টমার খুঁজে পাওয়া যায়নি!');
    }

    return prisma.measurement.findMany({
      where: {
        tailorCustomerId: link.id,
        isCurrent: true,
      },
      include: {
        garmentType: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Save new measurement with automatic version history archiving.
   */
  async saveMeasurement(tailorProfileId: string, data: SaveMeasurementInput) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId: data.customerId,
        },
      },
    });

    if (!link) {
      throw new Error('কাস্টমার এই টেইলারের সাথে যুক্ত নন!');
    }

    // 1. Find existing current measurement
    const existingCurrent = await prisma.measurement.findFirst({
      where: {
        tailorCustomerId: link.id,
        garmentTypeId: data.garmentTypeId,
        isCurrent: true,
      },
      orderBy: { version: 'desc' },
    });

    let nextVersion = 1;

    // 2. Archive previous measurement if exists
    if (existingCurrent) {
      nextVersion = existingCurrent.version + 1;
      await prisma.measurement.update({
        where: { id: existingCurrent.id },
        data: { isCurrent: false },
      });
    }

    // 3. Create fresh current measurement
    const newMeasurement = await prisma.measurement.create({
      data: {
        tailorCustomerId: link.id,
        garmentTypeId: data.garmentTypeId,
        values: data.values,
        unit: data.unit,
        note: data.note,
        photoUrls: data.photoUrls || [],
        version: nextVersion,
        isCurrent: true,
        takenAt: new Date(),
      },
      include: {
        garmentType: true,
      },
    });

    return newMeasurement;
  }

  /**
   * Get version history of a specific garment's measurement for comparisons.
   */
  async getMeasurementHistory(
    tailorProfileId: string,
    customerId: string,
    garmentTypeId: string
  ) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId,
        },
      },
    });

    if (!link) {
      throw new Error('কাস্টমার খুঁজে পাওয়া যায়নি!');
    }

    return prisma.measurement.findMany({
      where: {
        tailorCustomerId: link.id,
        garmentTypeId,
      },
      orderBy: { version: 'desc' },
      include: {
        garmentType: true,
      },
    });
  }
}

export const measurementsService = new MeasurementsService();
export default measurementsService;

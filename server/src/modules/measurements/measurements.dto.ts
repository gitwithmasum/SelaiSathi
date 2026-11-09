import { z } from 'zod';
import { MeasurementUnit } from '@prisma/client';

export const saveMeasurementSchema = z.object({
  customerId: z.string().uuid('সঠিক কাস্টমার আইডি দিন'),
  garmentTypeId: z.string().uuid('সঠিক পোশাকের ধরন দিন'),
  values: z.record(z.union([z.number(), z.string()])),
  unit: z.enum([MeasurementUnit.INCH, MeasurementUnit.CM]).default(MeasurementUnit.INCH),
  note: z.string().optional(),
  photoUrls: z.array(z.string().url()).optional().default([]),
});

export const createGarmentTypeSchema = z.object({
  nameBn: z.string().min(2, 'বাংলা নাম দিন'),
  nameEn: z.string().min(2, 'ইংরেজি নাম দিন'),
  icon: z.string().optional(),
  fields: z.array(
    z.object({
      key: z.string(),
      labelBn: z.string(),
      unit: z.string().default('inch'),
      min: z.number().optional(),
      max: z.number().optional(),
      defaultValue: z.number().optional(),
    })
  ),
  styleOptions: z.array(
    z.object({
      category: z.string(),
      labelBn: z.string(),
      options: z.array(z.string()),
    })
  ).optional(),
});

export type SaveMeasurementInput = z.infer<typeof saveMeasurementSchema>;
export type CreateGarmentTypeInput = z.infer<typeof createGarmentTypeSchema>;

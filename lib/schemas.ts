import { z } from 'zod'

export const SurgeonSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  specialty: z.string().optional().nullable(),
  hospital: z.string().optional().nullable(),
  initials: z.string().max(3).optional().nullable(),
  last_case_date: z.string().optional().nullable(),
  created_at: z.string().optional(),
})

export const ProcedureSchema = z.object({
  id: z.string().uuid(),
  surgeon_id: z.string().uuid(),
  name: z.string().min(1),
  sub_type: z.string().optional().nullable(),
  icon: z.string().default('🔩'),
  setup_notes: z.string().optional().nullable(),
  timing_notes: z.string().optional().nullable(),
  rep_notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
})

export const PREFERENCE_TYPES = ['Implant Preference', 'Bail Out'] as const

export const ImplantPreferenceSchema = z.object({
  id: z.string().uuid(),
  procedure_id: z.string().uuid(),
  preference_type: z.enum(PREFERENCE_TYPES),
  implant_name: z.string().min(1),
  part_number: z.string().optional().nullable(),
  detail_notes: z.string().optional().nullable(),
  updated_at: z.string().optional(),
})

export const FlagSchema = z.object({
  id: z.string().uuid(),
  procedure_id: z.string().uuid(),
  text: z.string().min(1),
  created_at: z.string().optional(),
})

export const ShareSchema = z.object({
  id: z.string().uuid(),
  token: z.string().min(1),
  procedure_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().optional(),
  revoked_at: z.string().nullable().optional(),
})

export const UserProfileSchema = z.object({
  user_id: z.string().uuid(),
  onboarding_complete: z.boolean(),
  created_at: z.string().optional(),
})

export type Surgeon = z.infer<typeof SurgeonSchema>
export type Procedure = z.infer<typeof ProcedureSchema>
export type ImplantPreference = z.infer<typeof ImplantPreferenceSchema>
export type Flag = z.infer<typeof FlagSchema>
export type Share = z.infer<typeof ShareSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>

export const CreateSurgeonSchema = SurgeonSchema.pick({
  name: true,
  specialty: true,
  hospital: true,
  initials: true,
})

export const CreateProcedureSchema = ProcedureSchema.pick({
  name: true,
  sub_type: true,
  icon: true,
})

export const UpsertImplantSchema = ImplantPreferenceSchema.pick({
  preference_type: true,
  implant_name: true,
  part_number: true,
  detail_notes: true,
})

export const UpdateProcedureSchema = ProcedureSchema.pick({
  name: true,
  sub_type: true,
  icon: true,
  setup_notes: true,
  timing_notes: true,
  rep_notes: true,
}).partial()

export const ReplaceFlagsSchema = z.object({
  texts: z.array(z.string()),
})

export const ReplaceImplantsSchema = z.object({
  items: z.array(UpsertImplantSchema),
})

export const CreateShareSchema = z.object({
  procedure_id: z.string().uuid(),
})

export type CreateSurgeonInput = z.infer<typeof CreateSurgeonSchema>
export type CreateProcedureInput = z.infer<typeof CreateProcedureSchema>
export type UpsertImplantInput = z.infer<typeof UpsertImplantSchema>
export type UpdateProcedureInput = z.infer<typeof UpdateProcedureSchema>
export type CreateShareInput = z.infer<typeof CreateShareSchema>

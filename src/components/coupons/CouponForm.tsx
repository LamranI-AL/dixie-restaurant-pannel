/** @format */

"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import {
//   createCoupon,
//   updateCoupon,
//   checkCouponCodeExists,
// } from "@/lib/firebase/coupons";

import { Coupon } from "@/lib/types";
import {
  checkCouponCodeExists,
  createCoupon,
  updateCoupon,
} from "@/actions/coupons";

// Schéma de validation avec Zod
const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Le code doit comporter au moins 3 caractères")
    .max(20, "Le code ne peut pas dépasser 20 caractères"),
  description: z
    .string()
    .min(5, "La description doit comporter au moins 5 caractères"),
  discountType: z.enum(["percentage", "fixed"], {
    errorMap: () => ({ message: "Veuillez sélectionner un type de réduction" }),
  }),
  discountValue: z.number().positive("La valeur doit être positive"),
  minOrderValue: z
    .number()
    .min(0, "La valeur ne peut pas être négative")
    .optional(),
  maxDiscountAmount: z
    .number()
    .min(0, "La valeur ne peut pas être négative")
    .optional(),
  startDate: z.date({ required_error: "La date de début est requise" }),
  endDate: z.date({ required_error: "La date de fin est requise" }),
  maxUses: z
    .number()
    .int()
    .min(0, "La valeur ne peut pas être négative")
    .optional(),
  isActive: z.boolean(),
  restaurantId: z.string(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: Coupon;
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CouponForm: React.FC<CouponFormProps> = ({
  coupon,
  restaurantId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditMode] = useState(!!coupon);

  // Formatage des dates pour le formulaire
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
  };

  // Configuration du formulaire avec react-hook-form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code || "",
      description: coupon?.description || "",
      discountType: coupon?.discountType || "percentage",
      discountValue: coupon?.discountValue || 0,
      minOrderValue: coupon?.minOrderValue || 0,
      maxDiscountAmount: coupon?.maxDiscountAmount || 0,
      startDate: coupon?.startDate ? new Date(coupon.startDate) : new Date(),
      endDate: coupon?.endDate
        ? new Date(coupon.endDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours par défaut
      maxUses: coupon?.maxUses || 0,
      isActive: coupon?.isActive ?? true,
      restaurantId: coupon?.restaurantId || restaurantId,
    },
  });

  const discountType = watch("discountType");

  // Soumission du formulaire
  const onSubmit = async (data: CouponFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Vérifier si le code existe déjà (uniquement pour les nouveaux coupons)
      if (!isEditMode) {
        const codeExists = await checkCouponCodeExists(data.code);
        if (codeExists.success && codeExists.exists) {
          setErrorMessage(
            "Ce code de coupon existe déjà. Veuillez en choisir un autre.",
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Créer ou mettre à jour le coupon
      const result = isEditMode
        ? await updateCoupon(coupon!.id, data)
        : await createCoupon(data);

      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur dans le formulaire de coupon:", error);
      setErrorMessage("Une erreur inattendue est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code du coupon */}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-1">
            Code du coupon*
          </label>
          <input
            id="code"
            type="text"
            {...register("code")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isEditMode} // Ne pas permettre l'édition du code pour éviter les confusions
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        {/* Type de réduction */}
        <div>
          <label
            htmlFor="discountType"
            className="block text-sm font-medium text-gray-700 mb-1">
            Type de réduction*
          </label>
          <select
            id="discountType"
            {...register("discountType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
            <option value="percentage">Pourcentage (%)</option>
            <option value="fixed">Montant fixe (MAD)</option>
          </select>
          {errors.discountType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.discountType.message}
            </p>
          )}
        </div>

        {/* Valeur de la réduction */}
        <div>
          <label
            htmlFor="discountValue"
            className="block text-sm font-medium text-gray-700 mb-1">
            Valeur de la réduction*{" "}
            {discountType === "percentage" ? "(%)" : "(MAD)"}
          </label>
          <input
            id="discountValue"
            type="number"
            step={discountType === "percentage" ? "1" : "0.01"}
            min="0"
            max={discountType === "percentage" ? "100" : undefined}
            {...register("discountValue", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.discountValue && (
            <p className="mt-1 text-sm text-red-600">
              {errors.discountValue.message}
            </p>
          )}
        </div>

        {/* Montant minimum de commande */}
        <div>
          <label
            htmlFor="minOrderValue"
            className="block text-sm font-medium text-gray-700 mb-1">
            Montant minimum de commande (MAD)
          </label>
          <input
            id="minOrderValue"
            type="number"
            step="0.01"
            min="0"
            {...register("minOrderValue", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.minOrderValue && (
            <p className="mt-1 text-sm text-red-600">
              {errors.minOrderValue.message}
            </p>
          )}
        </div>

        {/* Montant maximum de réduction (pour les pourcentages) */}
        {discountType === "percentage" && (
          <div>
            <label
              htmlFor="maxDiscountAmount"
              className="block text-sm font-medium text-gray-700 mb-1">
              Montant maximum de réduction (MAD)
            </label>
            <input
              id="maxDiscountAmount"
              type="number"
              step="0.01"
              min="0"
              {...register("maxDiscountAmount", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.maxDiscountAmount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxDiscountAmount.message}
              </p>
            )}
          </div>
        )}

        {/* Nombre maximum d'utilisations */}
        <div>
          <label
            htmlFor="maxUses"
            className="block text-sm font-medium text-gray-700 mb-1">
            Nombre maximum d'utilisations (0 = illimité)
          </label>
          <input
            id="maxUses"
            type="number"
            min="0"
            step="1"
            {...register("maxUses", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.maxUses && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxUses.message}
            </p>
          )}
        </div>

        {/* Date de début */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1">
            Date de début*
          </label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <input
                id="startDate"
                type="date"
                value={formatDateForInput(field.value)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  field.onChange(date);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* Date de fin */}
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin*
          </label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <input
                id="endDate"
                type="date"
                value={formatDateForInput(field.value)}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  field.onChange(date);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1">
          Description*
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Statut actif/inactif */}
      <div className="flex items-center">
        <input
          id="isActive"
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label
          htmlFor="isActive"
          className="ml-2 block text-sm font-medium text-gray-700">
          Coupon actif
        </label>
      </div>

      {/* ID du restaurant (caché) */}
      <input
        type="hidden"
        {...register("restaurantId")}
      />

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium  bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
          {isSubmitting
            ? "Enregistrement..."
            : isEditMode
              ? "Mettre à jour"
              : "Créer le coupon"}
        </button>
      </div>
    </form>
  );
};

export default CouponForm;

/** @format */

"use client";

import React, { useState } from "react";
import { FiPlus, FiArrowLeft } from "react-icons/fi";
import CouponList from "@/components/coupons/CouponList";
import CouponForm from "@/components/coupons/CouponForm";
import { Coupon } from "@/lib/types";

const CouponsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | undefined>(
    undefined,
  );
  const [viewMode, setViewMode] = useState(false);
  const restaurantId = "";

  // Gérer le clic sur le bouton "Ajouter un coupon"
  const handleAddClick = () => {
    setSelectedCoupon(undefined);
    setViewMode(false);
    setShowForm(true);
  };

  // Gérer le clic sur le bouton "Modifier" d'un coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setViewMode(false);
    setShowForm(true);
  };

  // Gérer le clic sur le bouton "Voir" d'un coupon (en mode lecture seule)
  const handleViewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setViewMode(true);
    setShowForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCoupon(undefined);
  };

  // Gérer le succès de l'enregistrement d'un coupon
  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedCoupon(undefined);
    // Pas besoin de rafraîchir manuellement car nous utilisons revalidatePath dans les fonctions de service
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!showForm ? (
          <>
            {/* En-tête avec titre et bouton d'ajout */}
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                  Gestion des coupons
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Créez et gérez des codes de réduction pour vos clients
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  Ajouter un coupon
                </button>
              </div>
            </div>

            {/* Liste des coupons */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <CouponList
                  restaurantId={restaurantId}
                  onEdit={handleEditCoupon}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* En-tête du formulaire */}
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={handleCloseForm}
                className="mr-4 text-gray-500 hover:text-gray-700">
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate">
                {selectedCoupon
                  ? viewMode
                    ? `Détails du coupon: ${selectedCoupon.code}`
                    : `Modifier le coupon: ${selectedCoupon.code}`
                  : "Créer un nouveau coupon"}
              </h1>
            </div>

            {/* Formulaire de coupon */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                {viewMode ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Code
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.code}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Type de réduction
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.discountType === "percentage"
                            ? `${selectedCoupon?.discountValue}% de réduction`
                            : `${selectedCoupon?.discountValue.toFixed(2)}€ de réduction`}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Période de validité
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          Du{" "}
                          {new Date(
                            selectedCoupon?.startDate!,
                          ).toLocaleDateString()}
                          au{" "}
                          {new Date(
                            selectedCoupon?.endDate!,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Utilisations
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.usesCount}
                          {selectedCoupon?.maxUses
                            ? ` / ${selectedCoupon?.maxUses}`
                            : " (illimité)"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Montant minimum
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.minOrderValue
                            ? `${selectedCoupon?.minOrderValue.toFixed(2)}€`
                            : "Aucun minimum"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Réduction maximale
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.discountType === "percentage" &&
                          selectedCoupon?.maxDiscountAmount
                            ? `${selectedCoupon?.maxDiscountAmount.toFixed(2)}€`
                            : "Non applicable"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">
                          Description
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedCoupon?.description}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Statut
                        </h3>
                        <p className="mt-1 text-sm text-gray-900">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedCoupon?.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                            {selectedCoupon?.isActive ? "Actif" : "Inactif"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode(false);
                          if (selectedCoupon) {
                            handleEditCoupon(selectedCoupon);
                          }
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Modifier
                      </button>
                    </div>
                  </div>
                ) : (
                  <CouponForm
                    coupon={selectedCoupon}
                    restaurantId={restaurantId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCloseForm}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;

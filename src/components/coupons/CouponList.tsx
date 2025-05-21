/** @format */

"use client";

import React, { useState, useEffect } from "react";
import {
  getAllCoupons,
  getCouponsByRestaurant,
  deleteCoupon,
  toggleCouponActive,
} from "@/actions/coupons";
import { Coupon } from "@/lib/types";
import { FiEdit2, FiTrash2, FiEye, FiAlertCircle } from "react-icons/fi";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
// import { getCouponsByRestaurant } from "@/actions/coupons";

interface CouponListProps {
  restaurantId?: string;
  onEdit: (coupon: Coupon) => void;
  viewOnly?: boolean;
}

const CouponList: React.FC<CouponListProps> = ({
  restaurantId,
  onEdit,
  viewOnly = false,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  // Charger les coupons
  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = restaurantId
        ? await getCouponsByRestaurant(restaurantId)
        : await getAllCoupons();

      if (response.success && response.coupons) {
        // Trier les coupons : actifs d'abord, puis par date de fin (les plus proches en premier)
        const sortedCoupons = [...response.coupons].sort((a, b) => {
          // D'abord trier par état actif/inactif
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }

          // Ensuite par date de fin (croissant)
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });

        setCoupons(sortedCoupons);
      } else {
        setError("Impossible de charger les coupons");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des coupons:", err);
      setError("Une erreur est survenue lors du chargement des coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [restaurantId]);

  // Gérer la suppression d'un coupon
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      setDeleting(true);
      const result = await deleteCoupon(couponToDelete.id);

      if (result.success) {
        loadCoupons(); // Recharger la liste
        setIsDeleteModalOpen(false);
      } else {
        setError(result.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du coupon:", err);
      setError("Une erreur est survenue lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  // Gérer l'activation/désactivation d'un coupon
  const handleToggleActive = async (coupon: Coupon) => {
    try {
      setToggleLoading(coupon.id);
      const result = await toggleCouponActive(coupon.id, !coupon.isActive);

      if (result.success) {
        // Mettre à jour l'état local
        setCoupons((prevCoupons) =>
          prevCoupons.map((c) =>
            c.id === coupon.id ? { ...c, isActive: !c.isActive } : c,
          ),
        );
      } else {
        setError(result.error || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
      setError("Une erreur est survenue");
    } finally {
      setToggleLoading(null);
    }
  };

  // Vérifier si un coupon est expiré
  const isCouponExpired = (coupon: Coupon) => {
    return new Date() > new Date(coupon.endDate);
  };

  // Vérifier si un coupon a atteint sa limite d'utilisation
  const hasReachedMaxUses = (coupon: Coupon) => {
    return (
      coupon.maxUses !== undefined &&
      coupon.maxUses > 0 &&
      coupon.usesCount >= coupon.maxUses
    );
  };

  // Formater une date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  // Calculer les jours restants
  const getDaysRemaining = (endDate: Date) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">Chargement des coupons...</div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun coupon trouvé. Créez votre premier coupon !
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Réduction
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Validité
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisations
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {coupons.map((coupon) => {
            const expired = isCouponExpired(coupon);
            const maxUsesReached = hasReachedMaxUses(coupon);
            const daysRemaining = getDaysRemaining(coupon.endDate);

            return (
              <tr
                key={coupon.id}
                className={expired ? "bg-gray-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {coupon.code}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {coupon.description}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue.toFixed(2)}MAD`}
                  </div>
                  {coupon.minOrderValue && coupon.minOrderValue > 0 && (
                    <div className="text-xs text-gray-500">
                      Min: {coupon.minOrderValue.toFixed(2)}MAD
                    </div>
                  )}
                  {coupon.discountType === "percentage" &&
                    coupon.maxDiscountAmount && (
                      <div className="text-xs text-gray-500">
                        Max: {coupon.maxDiscountAmount.toFixed(2)}MAD
                      </div>
                    )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    Du {formatDate(coupon.startDate)} au{" "}
                    {formatDate(coupon.endDate)}
                  </div>
                  {!expired ? (
                    <div
                      className={`text-xs ${daysRemaining <= 5 ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                      {daysRemaining <= 0
                        ? "Expire aujourd'hui"
                        : `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} restant${daysRemaining > 1 ? "s" : ""}`}
                    </div>
                  ) : (
                    <div className="text-xs text-red-500 font-semibold">
                      Expiré
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {coupon.usesCount}
                    {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </div>
                  {maxUsesReached && (
                    <div className="text-xs text-red-500">Limite atteinte</div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {!viewOnly ? (
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      disabled={!!toggleLoading}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {toggleLoading === coupon.id ? (
                        <span>...</span>
                      ) : (
                        <span>{coupon.isActive ? "Actif" : "Inactif"}</span>
                      )}
                    </button>
                  ) : (
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {coupon.isActive ? "Actif" : "Inactif"}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {!viewOnly && (
                      <>
                        <button
                          onClick={() => onEdit(coupon)}
                          className="text-indigo-600 hover:text-indigo-900">
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(coupon)}
                          className="text-red-600 hover:text-red-900">
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {viewOnly && (
                      <button
                        onClick={() => onEdit(coupon)}
                        className="text-indigo-600 hover:text-indigo-900">
                        <FiEye className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal de confirmation de suppression */}
      <Transition
        show={isDeleteModalOpen}
        as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsDeleteModalOpen(false)}>
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0">
              {/* <Dialog className="fixed inset-0 bg-black opacity-30" /> */}
            </Transition.Child>

            {/* Centrer la boîte de dialogue */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900">
                  Confirmer la suppression
                </Dialog.Title>

                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Êtes-vous sûr de vouloir supprimer le coupon{" "}
                    <span className="font-bold">{couponToDelete?.code}</span> ?
                    Cette action est irréversible.
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsDeleteModalOpen(false)}>
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={confirmDelete}
                    disabled={deleting}>
                    {deleting ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CouponList;

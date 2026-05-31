import { useAuthStore } from "./useAuthStore";

export const useUserRole = () => {
  const { user } = useAuthStore();

  const isEmpresa = user?.role === "EMPRESA";
  const isVendedor = user?.role === "VENDEDOR";
  const isTecnico = user?.role === "TECNICO";

  const canManageUsers = isEmpresa;
  const canManageBranches = isEmpresa;
  const canManageProducts = isEmpresa || isTecnico;
  const canManageEmpresas = isTecnico;
  const canViewAllOrders = isEmpresa || isTecnico;
  const canViewBranchOrders = isEmpresa || isVendedor;
  const canCreateOrders = isEmpresa || isVendedor;
  const canViewCompanyColumns = isEmpresa;
  const canViewTechnicianColumns = isTecnico;

  return {
    user,
    role: user?.role,
    isEmpresa,
    isVendedor,
    isTecnico,
    canManageUsers,
    canManageBranches,
    canManageProducts,
    canManageEmpresas,
    canViewAllOrders,
    canViewBranchOrders,
    canCreateOrders,
    canViewCompanyColumns,
    canViewTechnicianColumns,
  };
};

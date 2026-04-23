export interface Tire {
  id: string;
  name?: string;
  position: string;
  pressure: string;
  type: string;
  makeModel: string;
  lastInspected?: string;
  hasIssue?: boolean;
  photoUri?: string;
  NSD?: string;
  CNSD?: string;
  LNSD?: string;
  RNSD?: string;
  issues?: string;
}

export interface Vehicle {
  active: boolean;
  activeStatusText: string;
  address: string;
  apiRunDateTime: string | null;
  axles: number | null;
  brand: string;
  capacity: string;
  chassisNo: string;
  city: string | null;
  company: string;
  concernedContact: string | null;
  concernedPerson: string;
  costCenter: string | null;
  createdBy: string;
  createdDate: string;
  engineNo: string;
  fitnessUpto: string | null;
  fitnessUptoFormatted: string | null;
  fuelType: string | null;
  grossWeight: string;
  groupId: string | null;
  height: string;
  helper1: string | null;
  helper2: string | null;
  insuranceUpto: string | null;
  insuranceUptoFormatted: string | null;
  isCommercialVehicle: boolean | null;
  lastUpdatedBy: string | null;
  lastUpdatedDate: string | null;
  length: string;
  managedTruck: string;
  manufacturingYear: string;
  model: string;
  nationalPermitUpto: string | null;
  nationalPermitUptoFormatted: string | null;
  note: string | null;
  odometerDailyLimit: number | null;
  ownerContact: string;
  ownerName: string;
  ownership: string;
  panNo: string;
  permitValidUpto: string | null;
  permitValidUptoFormatted: string | null;
  phoneCode: string | null;
  physicalCondition: string | null;
  pollutionUpto: string | null;
  pollutionUptoFormatted: string | null;
  projectedAverageMilage: string | null;
  registrationDate: string;
  registrationDateFormatted: string;
  route: string;
  rto: string | null;
  serialNoRc: string | null;
  status: string;
  taxUpto: string | null;
  taxUptoFormatted: string | null;
  transmission: string | null;
  tripCode: string | null;
  typeOfBody: string;
  tyres: string;
  unladenWeight: string | null;
  vehicleNo: string;
  vehicleScope: string | null;
  vehicleType: string;
  vehicleTypeText: string;
  wheelbase: string | null;
  width: string;
  // Internal fields
  id: string; // Map from vehicleNo or common ID if available
  tires: Tire[];
  tireStructure?: string;
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  type: string;
  quantity: string;
  rate: string;
  totalAmount: string;
  date: string;
  isAIScanned: boolean;
}

// Simulated simple store using a hook pattern (could be replaced by Redux/Zustand)
export const initialVehicles: Vehicle[] = [
  {
    active: true,
    activeStatusText: 'Active',
    address: 'Vizag, AP',
    apiRunDateTime: null,
    axles: null,
    brand: 'B0002',
    capacity: '16',
    chassisNo: 'CHAP053291',
    city: null,
    company: 'VL00000001',
    concernedContact: null,
    concernedPerson: 'Fleetable Test',
    costCenter: null,
    createdBy: 'e000001',
    createdDate: '2025-08-27T14:36:49.703',
    engineNo: 'ENVIJK3291',
    fitnessUpto: null,
    fitnessUptoFormatted: null,
    fuelType: null,
    grossWeight: '14',
    groupId: null,
    height: '3',
    helper1: null,
    helper2: null,
    insuranceUpto: null,
    insuranceUptoFormatted: null,
    isCommercialVehicle: null,
    lastUpdatedBy: null,
    lastUpdatedDate: null,
    length: '8.5',
    managedTruck: 'True',
    manufacturingYear: '2021',
    model: 'M0022',
    nationalPermitUpto: null,
    nationalPermitUptoFormatted: null,
    note: null,
    odometerDailyLimit: null,
    ownerContact: '9174523289',
    ownerName: 'Fleetable Test',
    ownership: 'O',
    panNo: 'AAACD3004G',
    permitValidUpto: null,
    permitValidUptoFormatted: null,
    phoneCode: null,
    physicalCondition: null,
    pollutionUpto: null,
    pollutionUptoFormatted: null,
    projectedAverageMilage: null,
    registrationDate: '2021-03-24T00:00:00',
    registrationDateFormatted: '24/03/2021',
    route: 'RT00000024',
    rto: null,
    serialNoRc: null,
    status: '1',
    taxUpto: null,
    taxUptoFormatted: null,
    transmission: null,
    tripCode: null,
    typeOfBody: 'Tipper',
    tyres: '8',
    unladenWeight: null,
    vehicleNo: 'AP05CJ3291',
    vehicleScope: null,
    vehicleType: 'Truck',
    vehicleTypeText: 'Truck',
    wheelbase: null,
    width: '2.5',
    id: '1',
    tires: Array.from({ length: 8 }, (_, i) => ({
      id: `tire-1-${i + 1}`,
      position: `pos-${i + 1}`,
      pressure: '32 PSI',
      type: 'Radial',
      makeModel: 'Michelin Agilis',
    })),
  },
];

// This is a simplified version of state management for the demo
// In a real app, this would be in a proper Context or Redux store

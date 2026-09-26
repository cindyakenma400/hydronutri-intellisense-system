import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Bell,
  Droplets,
  Sprout,
  FlaskConical,
  Leaf,
  Cpu,
  Database,
  Info,
} from "lucide-react";

export const STORAGE_KEY = "hydronutri.settings.v2";

export type CropType = "Maize" | "Tomato" | "Onion";

export type Settings = {
  farmName: string;
  farmerName: string;
  location: string;
  cropType: CropType;
  farmSize: string;
  email: string;
  phone: string;

  // The crop currently planted — determines the NPK thresholds
  // the fertilizer valve uses to start and stop dosing.
  currentCrop: CropType;

  autoIrrigation: boolean;
  moistureTrigger: number;
  moistureStop: number;
  maxPumpMinutes: number;

  autoFertilization: boolean;
  fertilizerDurationSeconds: number;

  soilQualityAssessment: boolean;
  assessmentFrequencyHours: number;

  diseaseDetection: boolean;
  confidenceThreshold: number;

  notifyInApp: boolean;
  notifyEmail: boolean;
  notifySoilMoisture: boolean;
  notifyIrrigation: boolean;
  notifyFertilization: boolean;
  notifySoilQuality: boolean;
  notifyDisease: boolean;
  notifySystem: boolean;
};

export const DEFAULTS: Settings = {
  farmName: "Akenma Family Farm",
  farmerName: "",
  location: "Accra, Ghana",
  cropType: "Tomato",
  farmSize: "",
  email: "",
  phone: "",

  currentCrop: "Tomato",

  autoIrrigation: true,
  moistureTrigger: 45,
  moistureStop: 80,
  maxPumpMinutes: 15,

  autoFertilization: true,
  fertilizerDurationSeconds: 30,

  soilQualityAssessment: true,
  assessmentFrequencyHours: 6,

  diseaseDetection: true,
  confidenceThreshold: 70,

  notifyInApp: true,
  notifyEmail: false,
  notifySoilMoisture: true,
  notifyIrrigation: true,
  notifyFertilization: true,
  notifySoilQuality: true,
  notifyDisease: true,
  notifySystem: true,
};

export const NAV_SECTIONS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Account & Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "irrigation", label: "Automatic Irrigation", icon: Droplets },
  { id: "fertilization", label: "Automatic Fertilization", icon: Sprout },
  { id: "soilQuality", label: "Soil Quality Assessment", icon: FlaskConical },
  { id: "disease", label: "Disease Detection", icon: Leaf },
  { id: "devices", label: "Connected Devices", icon: Cpu },
  { id: "privacy", label: "Data & Privacy", icon: Database },
  { id: "about", label: "About", icon: Info },
] as const;

export type SectionId = (typeof NAV_SECTIONS)[number]["id"];

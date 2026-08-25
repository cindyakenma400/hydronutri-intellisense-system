import type { LucideIcon } from "lucide-react";
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
  Camera,
  Gauge,
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

  autoIrrigation: boolean;
  moistureTrigger: number;
  maxPumpMinutes: number;

  autoFertilization: boolean;
  npkTrigger: number;
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

  autoIrrigation: true,
  moistureTrigger: 30,
  maxPumpMinutes: 15,

  autoFertilization: true,
  npkTrigger: 40,
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

export type DeviceStatus = {
  name: string;
  model: string;
  icon: LucideIcon;
  online: boolean;
};

export const DEVICES: DeviceStatus[] = [
  { name: "ESP32 Controller", model: "Main sensor & control hub", icon: Cpu, online: true },
  { name: "ESP32-CAM", model: "Leaf imaging module", icon: Camera, online: true },
  { name: "Soil Sensor", model: "CWT-SOIL-NPKPHCTH-S", icon: Gauge, online: true },
  { name: "Water Pump", model: "Irrigation actuator", icon: Droplets, online: false },
  { name: "Fertilizer Pump", model: "Nutrient dosing actuator", icon: FlaskConical, online: true },
];

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

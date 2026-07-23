export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "textarea";
  suffix?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  applicableTo: string[];
  fields: FormField[];
}

export const serviceTypesList: ServiceType[] = [
  {
    id: "dog_training",
    name: "Dog training",
    description: "Behavioral training, puppy socialization, obedience classes, and agility coaching.",
    applicableTo: ["dog_service_provider", "cynological_association"],
    fields: [
      {
        name: "targetLevel",
        label: "Target Level",
        type: "select",
        options: ["Puppy Basic Socialization", "Intermediate Obedience", "Advanced Agility"],
        required: true,
      },
      {
        name: "sessions",
        label: "Number of Sessions",
        type: "number",
        suffix: "Sessions",
        placeholder: "e.g., 8",
        required: true,
      },
    ],
  },
  {
    id: "dog_boarding",
    name: "Dog boarding",
    description: "Overnight stays, boarding services, and day care facilities.",
    applicableTo: ["dog_kennel", "ngo"],
    fields: [
      {
        name: "nights",
        label: "Number of Nights",
        type: "number",
        suffix: "Nights",
        placeholder: "e.g., 3",
        required: true,
      },
      {
        name: "roomCategory",
        label: "Room Category",
        type: "select",
        options: ["Standard Room", "Deluxe Suite", "VIP Cabin"],
        required: true,
      },
      {
        name: "dietaryNeeds",
        label: "Dietary Needs & Medical Care",
        type: "textarea",
        placeholder: "Specify feeding schedules or medication...",
        required: false,
      },
    ],
  },
  {
    id: "sport_dog_training",
    name: "Dog sports training",
    description: "Advanced training for dog sports such as Agility, IGP/Schutzhund, Obedience, or Flyball.",
    applicableTo: ["dog_service_provider", "cynological_association"],
    fields: [
      {
        name: "discipline",
        label: "Sport Discipline",
        type: "select",
        options: ["Agility", "IGP / Schutzhund", "Obedience", "Flyball"],
        required: true,
      },
      {
        name: "experienceLevel",
        label: "Handler Experience Level",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced"],
        required: true,
      },
      {
        name: "sessions",
        label: "Number of Sessions",
        type: "number",
        suffix: "Sessions",
        placeholder: "e.g., 10",
        required: true,
      },
    ],
  },
  {
    id: "dog_walking",
    name: "Dog walking",
    description: "Daily exercise walks and outdoor activities for dogs.",
    applicableTo: ["dog_service_provider", "ngo"],
    fields: [
      {
        name: "distance",
        label: "Distance",
        type: "number",
        suffix: "Km",
        placeholder: "e.g., 5",
        required: true,
      },
      {
        name: "time",
        label: "Time",
        type: "number",
        suffix: "Minute",
        placeholder: "e.g., 45",
        required: true,
      },
      {
        name: "notes",
        label: "Special Instructions",
        type: "textarea",
        placeholder: "Any behavioral notes or route preferences...",
        required: false,
      },
    ],
  },
  {
    id: "dog_grooming",
    name: "Dog grooming",
    description: "Full grooming, bathing, hair trimming, nail clipping, and hygienic care for dogs.",
    applicableTo: ["dog_service_provider"],
    fields: [],
  },
];

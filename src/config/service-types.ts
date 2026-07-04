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
  applicableTo: ("dog_service_provider" | "dog_kennel" | "cynological_association" | "ngo")[];
  fields: FormField[];
}

export const serviceTypesList: ServiceType[] = [
  {
    id: "dog_walking",
    name: "Dog Walking",
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
    id: "pet_boarding",
    name: "Pet Boarding",
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
    id: "dog_training",
    name: "Dog Training",
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
    id: "dog_grooming",
    name: "Dog Grooming",
    description: "Professional washing, styling, nail clipping, and general pet hygiene care.",
    applicableTo: ["dog_service_provider", "dog_kennel"],
    fields: [
      {
        name: "coatLength",
        label: "Coat Length",
        type: "select",
        options: ["Short Coat", "Medium Coat", "Long / Double Coat"],
        required: true,
      },
      {
        name: "package",
        label: "Package Type",
        type: "select",
        options: ["Bath & Brush Only", "Full Hygienic Trim", "VIP Show Preparation"],
        required: true,
      },
    ],
  },
  {
    id: "pedigree_registration",
    name: "Pedigree Registration",
    description: "Official registration of purebred lineage, show listings, and cynicism certificates.",
    applicableTo: ["cynological_association"],
    fields: [
      {
        name: "microchip",
        label: "Microchip ID",
        type: "text",
        placeholder: "e.g., 642090000000000",
        required: true,
      },
      {
        name: "breed",
        label: "Breed Category",
        type: "select",
        options: [
          "Romanian Carpathian Shepherd",
          "German Shepherd",
          "Dachshund",
          "Golden Retriever",
          "Border Collie",
        ],
        required: true,
      },
    ],
  },
  {
    id: "rescue_rehoming",
    name: "Rescue & Rehoming",
    description: "Shelter hosting, veterinary assistance, rescue operations, and pet foster matching.",
    applicableTo: ["ngo"],
    fields: [
      {
        name: "fosterDuration",
        label: "Foster Duration",
        type: "number",
        suffix: "Days",
        placeholder: "e.g., 30",
        required: true,
      },
      {
        name: "emergencyNotes",
        label: "Emergency Medical Notes",
        type: "textarea",
        placeholder: "Describe rescue circumstances or urgent needs...",
        required: false,
      },
    ],
  },
];

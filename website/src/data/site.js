// Single source of truth for contact details — edit here, updates everywhere.
export const CONTACT = {
  phone: "+91 77956 92753",
  phoneRaw: "+917795692753",
  sosPhone: "+91 89045 94400",
  sosRaw: "+918904594400",
  email: "support@motorkonnect.com",
  address:
    "No 12, 13 & 12/A, Kirthan Arcade, 3rd Floor, Aditya Nagar, Bangalore – 560097",
  addressShort: "Aditya Nagar, Bangalore 560097",
  hours: "Mon – Sat · 9:00 AM – 7:00 PM",
  mapsQuery:
    "Abacco Technology, Kirthan Arcade, Aditya Nagar, Vidyaranyapura, Bangalore 560097",
};

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapsQuery)}`;
export const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapsQuery)}&output=embed`;

// App store links
export const APPS = {
  android: {
    app: "Motor Konnect",
    url: "https://play.google.com/store/apps/details?id=com.abacco.motorkonnect&pcampaignid=web_share",
  },
  ios: {
    app: "MotorDesk",
    url: "https://apps.apple.com/in/app/motordesk/id1671882337",
  },
};

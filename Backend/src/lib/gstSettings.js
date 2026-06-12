import { prisma } from "./prisma.js";

export const DEFAULT_GST_SETTINGS = {
  ratePercent: 5,
  label: "GST (5%)",
  gstin: "",
  showOnProducts: true,
  pricesIncludeGst: true,
};

export function normalizeGstSettings(value = {}) {
  const ratePercentRaw = Number(value.ratePercent ?? DEFAULT_GST_SETTINGS.ratePercent);
  const ratePercent =
    Number.isFinite(ratePercentRaw) && ratePercentRaw >= 0 && ratePercentRaw <= 100
      ? Math.round(ratePercentRaw * 100) / 100
      : DEFAULT_GST_SETTINGS.ratePercent;

  const label =
    String(value.label ?? `GST (${ratePercent}%)`).trim() || `GST (${ratePercent}%)`;

  return {
    ratePercent,
    rate: ratePercent / 100,
    label,
    gstin: String(value.gstin ?? "").trim().toUpperCase(),
    showOnProducts: value.showOnProducts !== false,
    pricesIncludeGst: value.pricesIncludeGst !== false,
  };
}

export async function getGstSettings() {
  const row = await prisma.storeSetting.findUnique({ where: { key: "gst" } });
  return normalizeGstSettings(row?.value ?? DEFAULT_GST_SETTINGS);
}

export async function saveGstSettings(input = {}) {
  const current = await getGstSettings();
  const next = normalizeGstSettings({
    ratePercent: input.ratePercent ?? current.ratePercent,
    label: input.label ?? current.label,
    gstin: input.gstin ?? current.gstin,
    showOnProducts: input.showOnProducts ?? current.showOnProducts,
    pricesIncludeGst: input.pricesIncludeGst ?? current.pricesIncludeGst,
  });

  await prisma.storeSetting.upsert({
    where: { key: "gst" },
    create: {
      key: "gst",
      value: {
        ratePercent: next.ratePercent,
        label: next.label,
        gstin: next.gstin,
        showOnProducts: next.showOnProducts,
        pricesIncludeGst: next.pricesIncludeGst,
      },
    },
    update: {
      value: {
        ratePercent: next.ratePercent,
        label: next.label,
        gstin: next.gstin,
        showOnProducts: next.showOnProducts,
        pricesIncludeGst: next.pricesIncludeGst,
      },
    },
  });

  return next;
}

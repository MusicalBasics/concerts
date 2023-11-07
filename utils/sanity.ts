import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false,
});

export const sanityAdminClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skHhHg8CnSmPV5G1Zduibkq2PKZ8HEqElBQofLLHNzojqu4n1zR8MBpkjdRbFNZuMvIEodoe2tWG7UkQLsuk6mjDnwHgrcdNlHQKFzPvhBosMLAwulZuyqWb37leLpSvHS9dEMo6Vbvg6rjSamY1J4IxIOMZCMo0PP2XghiyTvQNmV38r6ZH",
  useCdn: false, // Disable for authenticated requests
});

export async function resetSeat(
  seatingChartId: string,
  seactionName: string,
  rowId: string,
  seatNumber: string
) {
  // left-O-25
  console.log("seatingChartId", seatingChartId);
  // db1714bf-361a-4bf9-88a6-6950949dc532
  console.log("seactionName", seactionName);
  // left-O
  console.log("rowId", rowId);
  // 25
  console.log("seatNumber", seatNumber);

  try {
    const updatedSeatingChart = await sanityAdminClient
      .patch(seatingChartId)
      .set({
        [`sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].isReserved`]:
          false,
      })
      .unset([
        `sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].reservedBy`,
        `sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].redeemedTicket`,
      ])
      .commit({ autoGenerateArrayKeys: true });
    console.log("updatedSeatingChart", updatedSeatingChart);
    console.log(`Seat has been reset.`);
    return true;
  } catch (error: any) {
    console.error(`Failed to reset seat: ${error.message}`);
    return false;
  }
}

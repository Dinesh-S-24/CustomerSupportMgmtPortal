import { NextResponse } from "next/server";
import { customers } from "@/lib/mockData";

export async function GET(_req, { params }) {
  console.log("am inside GET");
  const { id } = await params;
  //check whaeather c2 =c2
  const customer = customers.find((item) => String(item._id) === String(id));
console.log("the itemid",customer);
  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Customer not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Success",
    data: customer,
  });
}

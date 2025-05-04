/** @format */

import React from "react";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <div>page of edit {id}</div>;
}

export default page;

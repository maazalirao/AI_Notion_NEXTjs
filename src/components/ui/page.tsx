"use client"

import { useParams } from "next/navigation"

function DocumentPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <div>
      <h1>Document ID: {id}</h1>
    </div>
  )
}

export default DocumentPage
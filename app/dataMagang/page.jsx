import Table from '@/components/Table'
import Navbar from '@/components/Navbar'
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoutes'

export default function page() {
  return (
    <ProtectedRoute>
      <div>
        <div className='p-6 max-w-full md:max-w-8xl mx-auto'>
          <Navbar />
          <Table />
        </div>
      </div>
    </ProtectedRoute>
  )
}

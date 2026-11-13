import React from 'react'
import { Outlet } from 'react-router-dom'
import SessionChecker from '../root/session'
import TopLoader from '../components/TopLoader'

const RootLayout = () => {
  return (
    <div>
      <SessionChecker/>
      <main>
      <TopLoader/>
        <Outlet/>
      </main>
    </div>
  )
}

export default RootLayout
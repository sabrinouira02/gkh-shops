import React, { memo, useState, useContext } from 'react'
import { Link } from '@inertiajs/react'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'

import { logo } from './../assets/brand/logo'
import { sygnet } from './../assets/brand/sygnet'
import navigation from '../_nav'
import { AppSidebarNav } from './AppSidebarNav'

// Create a context for sidebar state
export const SidebarContext = React.createContext({
  sidebarShow: true,
  sidebarUnfoldable: false,
  setSidebarShow: (show: boolean) => { },
  setSidebarUnfoldable: (unfoldable: boolean) => { },
})

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarShow, setSidebarShow] = useState(true)
  const [sidebarUnfoldable, setSidebarUnfoldable] = useState(false)

  return (
    <SidebarContext.Provider
      value={{
        sidebarShow,
        sidebarUnfoldable,
        setSidebarShow,
        setSidebarUnfoldable,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export const AppSidebar = memo(() => {
  const { sidebarShow, sidebarUnfoldable, setSidebarShow, setSidebarUnfoldable } = useSidebar()

  return (
    <CSidebar
      className="bg-dark-gradient border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={sidebarUnfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        setSidebarShow(visible)
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand as={Link} href="/dashboard">
          {/* <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} /> */}
          <img src="/logo-gkh.png" alt="Logo" className="sidebar-brand-full" width={180} />
          {/* <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} /> */}
          <img src="/logo-gkh.png" alt="Logo" className="sidebar-brand-narrow" width={180} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => setSidebarShow(false)}
        />
        <CSidebarToggler
          onClick={() => setSidebarUnfoldable(!sidebarUnfoldable)}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
    </CSidebar>
  )
})
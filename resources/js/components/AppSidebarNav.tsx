import React, { ReactNode, JSX, Suspense } from 'react'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { CBadge, CNavLink, CSidebarNav } from '@coreui/react-pro'

import type { Badge, NavItem } from '../_nav'
import { Link } from '@inertiajs/react'

export const AppSidebarNav = ({ items }: { items: NavItem[] }) => {
  const navLink = (
    name: string | JSX.Element,
    icon: string | ReactNode,
    badge?: Badge,
    indent = false,
  ) => {
    return (
      <>
        {icon
          ? icon
          : indent && (
              <span className="nav-icon">
                <span className="nav-icon-bullet"></span>
              </span>
            )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item: NavItem, index: number, indent = false) => {
    const { component, name, badge, icon, to, href, ...rest } = item
    const Component = component

    const linkProps = to
      ? { as: Link, href: to }
      : href
      ? { href: href, target: '_blank', rel: 'noopener noreferrer' }
      : {}

    return (
      <Component as="div" key={index}>
        {(to || href) ? (
          <CNavLink {...linkProps} {...rest}>
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  const navGroup = (item: NavItem, index: number) => {
    const { component, name, icon, items, ...rest } = item
    const Component = component
    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {items?.map((child, idx) =>
          child.items ? navGroup(child, idx) : navItem(child, idx, true),
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items?.map((item, index) =>
        item.items ? navGroup(item, index) : navItem(item, index),
      )}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
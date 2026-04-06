import { useEffect, useRef, useContext, useState } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import {
    CContainer,
    CForm,
    CFormInput,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CHeader,
    CHeaderNav,
    CHeaderToggler,
    CInputGroup,
    CInputGroupText,
    useColorModes,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
    cilContrast,
    cilApplicationsSettings,
    cilMenu,
    cilMoon,
    cilSearch,
    cilSun,
    cilLanguage,
    cifGb,
    cifDe,
    cifFr,
} from '@coreui/icons'

import {
    AppHeaderDropdown,
    AppHeaderDropdownMssg,
    AppHeaderDropdownNotif,
    AppHeaderDropdownTasks,
} from './header/index'

import { SidebarContext } from './app-sidebar'

export function AppSidebarHeader() {
    const headerRef = useRef<HTMLDivElement>(null)
    const { colorMode, setColorMode } = useColorModes('coreui-pro-react-admin-template-theme-modern')
    const { i18n, t } = useTranslation()

    const { sidebarShow, setSidebarShow } = useContext(SidebarContext)
    const [asideShow, setAsideShow] = useState(false)

    useEffect(() => {
        document.addEventListener('scroll', () => {
            if (headerRef.current) {
                headerRef.current.classList.toggle(
                    'shadow-sm',
                    document.documentElement.scrollTop > 0,
                );
            }
        });

    }, [])
    return (
        <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
            <CContainer className="px-4" fluid>
                <CHeaderToggler
                    className={classNames('d-lg-none', {
                        'prevent-hide': !sidebarShow,
                    })}
                    onClick={() => setSidebarShow(!sidebarShow)}
                    style={{ marginInlineStart: '-14px' }}
                >
                    <CIcon icon={cilMenu} size="lg" />
                </CHeaderToggler>
                <CForm className="d-none d-sm-flex">
                    <CInputGroup>
                        <CInputGroupText id="search-addon" className="bg-body-secondary border-0 px-1">
                            <CIcon icon={cilSearch} size="lg" className="my-1 mx-2 text-body-secondary" />
                        </CInputGroupText>
                        <CFormInput
                            placeholder={t('search')}
                            aria-label="Search"
                            aria-describedby="search-addon"
                            className="bg-body-secondary border-0"
                        />
                    </CInputGroup>
                </CForm>
                <CHeaderNav className="d-none d-md-flex ms-auto">
                    <AppHeaderDropdownNotif />
                    <AppHeaderDropdownTasks />
                    <AppHeaderDropdownMssg />
                </CHeaderNav>
                <CHeaderNav className="ms-auto ms-md-0">
                    <li className="nav-item py-1">
                        <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
                    </li>
                    <CDropdown variant="nav-item" placement="bottom-end">
                        <CDropdownToggle caret={false}>
                            <CIcon icon={cilLanguage} size="lg" />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem
                                active={i18n.language === 'en'}
                                className="d-flex align-items-center"
                                as="button"
                                onClick={() => i18n.changeLanguage('en')}
                            >
                                <CIcon className="me-2" icon={cifGb} size="lg" /> English
                            </CDropdownItem>
                            <CDropdownItem
                                active={i18n.language === 'fr'}
                                className="d-flex align-items-center"
                                as="button"
                                onClick={() => i18n.changeLanguage('fr')}
                            >
                                <CIcon className="me-2" icon={cifFr} size="lg" /> French
                            </CDropdownItem>
                            <CDropdownItem
                                active={i18n.language === 'de'}
                                className="d-flex align-items-center"
                                as="button"
                                onClick={() => i18n.changeLanguage('de')}
                            >
                                <CIcon className="me-2" icon={cifDe} size="lg" /> Deutsch
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                    <CDropdown variant="nav-item" placement="bottom-end">
                        <CDropdownToggle caret={false}>
                            {colorMode === 'dark' ? (
                                <CIcon icon={cilMoon} size="lg" />
                            ) : colorMode === 'auto' ? (
                                <CIcon icon={cilContrast} size="lg" />
                            ) : (
                                <CIcon icon={cilSun} size="lg" />
                            )}
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem
                                active={colorMode === 'light'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('light')}
                            >
                                <CIcon className="me-2" icon={cilSun} size="lg" /> {t('light')}
                            </CDropdownItem>
                            <CDropdownItem
                                active={colorMode === 'dark'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('dark')}
                            >
                                <CIcon className="me-2" icon={cilMoon} size="lg" /> {t('dark')}
                            </CDropdownItem>
                            <CDropdownItem
                                active={colorMode === 'auto'}
                                className="d-flex align-items-center"
                                as="button"
                                type="button"
                                onClick={() => setColorMode('auto')}
                            >
                                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                    <li className="nav-item py-1">
                        <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
                    </li>
                    <AppHeaderDropdown />
                </CHeaderNav>
                {/* <CHeaderToggler
                    onClick={() => setAsideShow(!asideShow)}
                    style={{ marginInlineEnd: '-12px' }}
                >
                    <CIcon icon={cilApplicationsSettings} size="lg" />
                </CHeaderToggler> */}
            </CContainer>
        </CHeader>
    );
}
import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle, Lock, User, CheckCircle2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
    CFormCheck
} from '@coreui/react-pro';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ canResetPassword, status }: LoginProps) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-vh-100 d-flex flex-row align-items-center bg-dark"
            style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, #2c3e50 0%, #000000 100%)',
                backgroundSize: 'cover'
            }}>
            <CContainer>
                <Head title={t('login_title')} />

                <CRow className="justify-content-center">
                    <CCol md={5} lg={4}>
                        <div className="text-center mb-4">
                            <img src="/logo-gkh.png" alt="Logo" width={220} className="mb-4 d-block mx-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }} />
                            <h4 className="text-white fw-light opacity-75">{t('platform_slogan')}</h4>
                        </div>

                        <CCard className="border-0 shadow-lg bg-white bg-opacity-10 backdrop-blur-md rounded-4 overflow-hidden"
                            style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CCardBody className="p-4 p-lg-5">
                                <CForm onSubmit={submit}>
                                    <div className="mb-4">
                                        <h2 className="text-white fw-bold mb-1">{t('login')}</h2>
                                        <p className="text-white opacity-50 small">{t('login_subtitle')}</p>
                                    </div>

                                    {status && (
                                        <div className="alert alert-success bg-success bg-opacity-10 border-success border-opacity-20 text-success small d-flex align-items-center gap-2 mb-4">
                                            <CheckCircle2 size={16} /> {status}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="text-white small fw-bold mb-2 opacity-75">{t('email')}</label>
                                        <CInputGroup className="bg-white rounded-3 overflow-hidden shadow-sm border-0">
                                            <CInputGroupText className="bg-white border-0 text-muted ps-3">
                                                <User size={18} />
                                            </CInputGroupText>
                                            <CFormInput
                                                className="bg-white border-0 text-dark py-2 ps-1 placeholder-muted"
                                                placeholder="votre@email.com"
                                                required
                                                autoComplete="username"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                        </CInputGroup>
                                        <InputError message={errors.email} className="mt-2 text-danger small shadow-sm bg-danger bg-opacity-10 p-1 rounded ps-2" />
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <label className="text-white small fw-bold opacity-75">{t('password')}</label>
                                            {canResetPassword && (
                                                <Link href={route('password.request')} className="text-primary text-decoration-none small opacity-75 hover-opacity-100 transition-all">
                                                    {t('forgot_password_q')}
                                                </Link>
                                            )}
                                        </div>
                                        <CInputGroup className="bg-white rounded-3 overflow-hidden shadow-sm border-0">
                                            <CInputGroupText className="bg-white border-0 text-muted ps-3">
                                                <Lock size={18} />
                                            </CInputGroupText>
                                            <CFormInput
                                                className="bg-white border-0 text-dark py-2 ps-1 placeholder-muted"
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                required
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                        </CInputGroup>
                                        <InputError message={errors.password} className="mt-2 text-danger small shadow-sm bg-danger bg-opacity-10 p-1 rounded ps-2" />
                                    </div>

                                    <div className="mb-4 d-flex align-items-center">
                                        <CFormCheck
                                            id="remember_me"
                                            label={<span className="text-white opacity-75 small cursor-pointer">{t('remember_me')}</span>}
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="border-white border-opacity-25"
                                        />
                                    </div>

                                    <CButton
                                        type="submit"
                                        color="primary"
                                        className="w-100 py-3 fw-bold text-uppercase rounded-3 shadow hover-translate-y transition-all d-flex align-items-center justify-content-center gap-2"
                                        disabled={processing}
                                        style={{ letterSpacing: '1px' }}
                                    >
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        {t('login')}
                                    </CButton>
                                </CForm>
                            </CCardBody>
                        </CCard>

                        <div className="text-center mt-5 text-white opacity-25 small">
                            &copy; {new Date().getFullYear()} GKH Management System. {t('secured')}
                        </div>
                    </CCol>
                </CRow>
            </CContainer>

            <style>{`
                .backdrop-blur-md {
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .hover-translate-y:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(50, 31, 219, 0.3) !important;
                }
                .placeholder-muted::placeholder {
                    color: #adb5bd !important;
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .cursor-pointer {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

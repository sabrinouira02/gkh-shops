import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

import { cilLockLocked, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow } from '@coreui/react-pro';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="bg-body-tertiary min-vh-100 d-flex align-items-center flex-row">
            <CContainer>
                <Head title="Register" />
                <CRow className="justify-content-center">
                    <CCol md={9} lg={7} xl={6}>
                        <CCard className="mx-4">
                            <CCardBody className="p-4">
                                <CForm onSubmit={submit}>
                                    <h1>Register</h1>
                                    <p className="text-body-secondary">Create your account</p>
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <CIcon icon={cilUser} />
                                        </CInputGroupText>
                                        <CFormInput
                                            placeholder="Username"
                                            autoComplete="username"
                                            disabled={processing}
                                            value={data.name}
                                            required
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                    </CInputGroup>
                                    <InputError message={errors.name} className="mt-2" />
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>@</CInputGroupText>
                                        <CFormInput
                                            placeholder="Email"
                                            autoComplete="email"
                                            disabled={processing}
                                            value={data.email}
                                            required
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </CInputGroup>
                                    <InputError message={errors.email} />
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <CIcon icon={cilLockLocked} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="password"
                                            placeholder="Password"
                                            autoComplete="new-password"
                                            disabled={processing}
                                            value={data.password}
                                            required
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                    </CInputGroup>
                                    <InputError message={errors.password} />
                                    <CInputGroup className="mb-4">
                                        <CInputGroupText>
                                            <CIcon icon={cilLockLocked} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="password"
                                            placeholder="Repeat password"
                                            autoComplete="new-password"
                                            disabled={processing}
                                            value={data.password_confirmation}
                                            required
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </CInputGroup>
                                    <InputError message={errors.password_confirmation} />
                                    <div className="d-grid">
                                        <CButton type="submit" color="success" disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Create Account
                                        </CButton>
                                    </div>
                                </CForm>
                                <div className="text-muted-foreground text-center text-sm">
                                    Already have an account?{' '}
                                    <TextLink href={route('login')} tabIndex={6}>
                                        Log in
                                    </TextLink>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    );
}

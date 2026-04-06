import { CAlert, CButton, CCol, CForm, CFormInput, CFormLabel, CRow, CSpinner } from '@coreui/react-pro';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<{ email: string }>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password" />

            {status && (
                <CAlert color="success" className="text-center">
                    {status}
                </CAlert>
            )}

            <CForm onSubmit={submit} className="space-y-4">
                <CRow className="mb-3">
                    <CCol xs={12}>
                        <CFormLabel htmlFor="email">Email address</CFormLabel>
                        <CFormInput
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="off"
                            autoFocus
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            invalid={Boolean(errors.email)}
                            feedback={errors.email}
                        />
                    </CCol>
                </CRow>

                <CButton type="submit" color="primary" className="w-100" disabled={processing}>
                    {processing && <CSpinner size="sm" className="me-2" />}
                    Email password reset link
                </CButton>
            </CForm>

            <div className="mt-4 text-center">
                <small className="text-body-secondary">
                    Or, return to <TextLink href={route('login')}>log in</TextLink>
                </small>
            </div>
        </>
    );
}

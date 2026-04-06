// Components
import { CAlert, CButton, CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react-pro';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email verification" />

            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <CCard className="w-100" style={{ maxWidth: '500px' }}>
                    <CCardHeader>
                        <h4 className="mb-0">Verify Email</h4>
                        <small className="text-muted">Please verify your email address by clicking the link we just emailed you.</small>
                    </CCardHeader>

                    <CCardBody>
                        {status === 'verification-link-sent' && (
                            <CAlert color="success" className="text-center">
                                A new verification link has been sent to your email address.
                            </CAlert>
                        )}

                        <form onSubmit={submit} className="text-center">
                            <CButton type="submit" color="primary" disabled={processing}>
                                {processing && <CSpinner size="sm" className="me-2" />}
                                Resend verification email
                            </CButton>

                            <div className="mt-3">
                                <form method="post" action={route('logout')}>
                                    <CButton type="submit" color="link" className="p-0">
                                        Log out
                                    </CButton>
                                </form>
                            </div>
                        </form>
                    </CCardBody>
                </CCard>
            </div>
        </>
    );
}

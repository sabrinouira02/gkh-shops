import { CButton, CCard, CCardBody, CCardHeader, CForm, CFormFeedback, CFormInput, CFormLabel, CSpinner } from '@coreui/react-pro';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset password" />

            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <CCard className="w-100" style={{ maxWidth: '500px' }}>
                    <CCardHeader>
                        <h4 className="mb-0">Reset Password</h4>
                        <small className="text-muted">Please enter your new password below</small>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={submit}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="email">Email</CFormLabel>
                                <CFormInput
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    readOnly
                                    feedbackInvalid={errors.email}
                                    invalid={Boolean(errors.email)}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <CFormFeedback invalid>{errors.email}</CFormFeedback>}
                            </div>

                            <div className="mb-3">
                                <CFormLabel htmlFor="password">Password</CFormLabel>
                                <CFormInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    autoFocus
                                    placeholder="Password"
                                    feedbackInvalid={errors.password}
                                    invalid={Boolean(errors.password)}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <CFormFeedback invalid>{errors.password}</CFormFeedback>}
                            </div>

                            <div className="mb-4">
                                <CFormLabel htmlFor="password_confirmation">Confirm Password</CFormLabel>
                                <CFormInput
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    placeholder="Confirm password"
                                    feedbackInvalid={errors.password_confirmation}
                                    invalid={Boolean(errors.password_confirmation)}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && <CFormFeedback invalid>{errors.password_confirmation}</CFormFeedback>}
                            </div>

                            <div className="d-grid">
                                <CButton type="submit" color="primary" disabled={processing}>
                                    {processing && <CSpinner size="sm" className="me-2" />}
                                    Reset Password
                                </CButton>
                            </div>
                        </CForm>
                    </CCardBody>
                </CCard>
            </div>
        </>
    );
}

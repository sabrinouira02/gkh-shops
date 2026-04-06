import { CButton, CCard, CCardBody, CCardHeader, CForm, CFormFeedback, CFormInput, CFormLabel, CSpinner } from '@coreui/react-pro';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirm password" />
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <CCard className="w-100" style={{ maxWidth: '500px' }}>
                    <CCardHeader>
                        <h4 className="mb-0">Confirm your password</h4>
                        <small className="text-muted">
                            This is a secure area of the application. Please confirm your password before continuing.
                        </small>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={submit}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="password">Password</CFormLabel>
                                <CFormInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    autoFocus
                                    value={data.password}
                                    invalid={Boolean(errors.password)}
                                    feedbackInvalid={errors.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <CFormFeedback invalid>{errors.password}</CFormFeedback>}
                            </div>

                            <div className="d-grid">
                                <CButton type="submit" color="primary" disabled={processing}>
                                    {processing && <CSpinner size="sm" className="me-2" />}
                                    Confirm password
                                </CButton>
                            </div>
                        </CForm>
                    </CCardBody>
                </CCard>
            </div>
        </>
    );
}

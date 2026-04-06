import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CForm,
    CFormInput,
    CFormLabel,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
} from '@coreui/react-pro';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUser() {
    const [visible, setVisible] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setVisible(false),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setVisible(false);
        clearErrors();
        reset();
    };

    return (
        <CCard className="mb-4">
            <CCardBody>
                <h4 className="mb-2">Delete account</h4>
                <p className="text-body-secondary mb-4">Delete your account and all of its resources.</p>

                <CAlert color="danger" className="mb-4">
                    <strong className="text-danger">Warning:</strong> This action is permanent and cannot be undone.
                </CAlert>

                <CButton color="danger" onClick={() => setVisible(true)}>
                    Delete account
                </CButton>

                <CModal visible={visible} onClose={closeModal} alignment="center" backdrop="static">
                    <CModalHeader>
                        <CModalTitle>Delete Account</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p>
                            Once your account is deleted, all of its resources and data will also be permanently removed. Please enter your password
                            to confirm this action.
                        </p>

                        <CForm onSubmit={deleteUser}>
                            <div className="mb-3">
                                <CFormLabel htmlFor="password">Password</CFormLabel>
                                <CFormInput
                                    type="password"
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />
                                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                            </div>
                            <CModalFooter>
                                <CButton color="secondary" variant="outline" onClick={closeModal}>
                                    Cancel
                                </CButton>
                                <CButton type="submit" color="danger" disabled={processing}>
                                    {processing ? 'Deleting...' : 'Delete account'}
                                </CButton>
                            </CModalFooter>
                        </CForm>
                    </CModalBody>
                </CModal>
            </CCardBody>
        </CCard>
    );
}

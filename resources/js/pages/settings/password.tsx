import React, { FormEventHandler, useRef } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CCard,
  CCardBody,
  CCardHeader
} from '@coreui/react-pro';
import { useForm, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Password settings',
    href: '/settings/password',
  },
];

export default function Password() {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const updatePassword: FormEventHandler = (e) => {
    e.preventDefault();

    put(route('password.update'), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors) => {
        if (errors.password) {
          reset('password', 'password_confirmation');
          passwordInput.current?.focus();
        }

        if (errors.current_password) {
          reset('current_password');
          currentPasswordInput.current?.focus();
        }
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        <CCard>
          <CCardHeader>
            <HeadingSmall
              title="Update password"
              description="Ensure your account is using a long, random password to stay secure"
            />
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={updatePassword} className="space-y-4">
              <div className="mb-3">
                <CFormLabel htmlFor="current_password">Current password</CFormLabel>
                <CFormInput
                  type="password"
                  id="current_password"
                  ref={currentPasswordInput}
                  autoComplete="current-password"
                  value={data.current_password}
                  onChange={(e) => setData('current_password', e.target.value)}
                />
                <InputError message={errors.current_password} />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="password">New password</CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  ref={passwordInput}
                  autoComplete="new-password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                />
                <InputError message={errors.password} />
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="password_confirmation">Confirm password</CFormLabel>
                <CFormInput
                  type="password"
                  id="password_confirmation"
                  autoComplete="new-password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <div className="d-flex align-items-center gap-3">
                <CButton type="submit" color="primary" disabled={processing}>
                  Save password
                </CButton>

                {recentlySuccessful && (
                  <CAlert color="success" className="mb-0 py-1 px-2">
                    Saved
                  </CAlert>
                )}
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </SettingsLayout>
    </AppLayout>
  );
}

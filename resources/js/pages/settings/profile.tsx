import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CRow,
  CCol,
} from '@coreui/react-pro';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Profile settings',
    href: '/settings/profile',
  },
];

type ProfileForm = {
  name: string;
  email: string;
};

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const { auth } = usePage<SharedData>().props;

  const { data, setData, patch, errors, processing, recentlySuccessful } =
    useForm<Required<ProfileForm>>({
      name: auth.user.name,
      email: auth.user.email,
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    patch(route('profile.update'), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <SettingsLayout>
        <CRow>
          <CCol>
            <h4 className="mb-2">Profile Information</h4>
            <p className="text-medium-emphasis mb-4">
              Update your name and email address
            </p>

            <CForm onSubmit={submit}>
              <div className="mb-3">
                <CFormLabel htmlFor="name">Name</CFormLabel>
                <CFormInput
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                  placeholder="Full name"
                />
                {errors.name && (
                  <div className="text-danger small mt-1">{errors.name}</div>
                )}
              </div>

              <div className="mb-3">
                <CFormLabel htmlFor="email">Email address</CFormLabel>
                <CFormInput
                  type="email"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  required
                  placeholder="Email address"
                />
                {errors.email && (
                  <div className="text-danger small mt-1">{errors.email}</div>
                )}
              </div>

              {mustVerifyEmail && auth.user.email_verified_at === null && (
                <CAlert color="warning">
                  Your email address is unverified.{' '}
                  <Link
                    href={route('verification.send')}
                    method="post"
                    as="button"
                    className="btn btn-link p-0"
                  >
                    Click here to resend the verification email.
                  </Link>
                  {status === 'verification-link-sent' && (
                    <div className="mt-2 text-success small">
                      A new verification link has been sent to your email
                      address.
                    </div>
                  )}
                </CAlert>
              )}

              <div className="d-flex align-items-center gap-3">
                <CButton color="primary" type="submit" disabled={processing}>
                  Save
                </CButton>

                <Transition
                  show={recentlySuccessful}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  leave="transition-opacity duration-300"
                  leaveTo="opacity-0"
                >
                  <p className="text-muted mb-0">Saved</p>
                </Transition>
              </div>
            </CForm>
          </CCol>
        </CRow>

        <hr className="my-5" />

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  );
}

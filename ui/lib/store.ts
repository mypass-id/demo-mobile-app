import { writable } from 'svelte/store';
import cloneDeep from 'lodash/cloneDeep';
import { persistent } from '~/lib/helpers';

/**
 * Determines if use has completed onboarding
 */
export const hasSetupAccount = persistent<boolean>('hasSetupAccount', false);

/**
 * Tracks with which version the data was created
 */
export const dataVersion = persistent<undefined | string>('dataVersion', undefined);

/**
 * QR Link
 */
export type QRLink = {
    channelId: string;
    password: string;
    challenge: string;
    requestedCredentials: string[];
    shareWith:
        | 'healthAuthority'
        | 'employer'
        | 'agency'
        | 'company'
        | 'insurance'
        | 'bank'
        | 'ancestorRegistry'
        | 'futureCommitment'
        | 'presentCommitment';
};

/**
 * Credential types
 */
export type CredentialTypes =
    | 'personal'
    | 'immunity'
    | 'visa'
    | 'company'
    | 'bank'
    | 'insurance'
    | 'futureCommitment'
    | 'presentCommitment';

/**
 * Personal credential information
 */
export type PersonalInfo = {
    firstName?: string;
    lastName?: string;
    dateOfBirth: string;
    birthPlace: string;
    nationality: string;
    countryOfResidence: string;
    address: string;
    identityCardNumber: string;
    passportNumber: string;
    phoneNumber: string;
    email: string;
};

/**
 * Immunity credential information
 */
export type ImmunityInfo = {
    testId: string;
    testedBy: string;
    testTimestamp: string;
    testKit: string;
    testResult: string;
};

/**
 * Visa application credential information
 */
export type VisaInfo = {
    visaApplicationNumber: string;
    visaCountry: string;
};

/**
 * Company credential information
 */
export type CompanyInfo = {
    companyName: string;
    companyAddress: string;
    companyType: string;
    companyBusiness: string;
    companyNumber: string;
    companyOwner: string;
    companyStatus: string;
    companyCreationDate: string;
};

/**
 * Bank account credential information
 */
export type BankInfo = {
    accountType: string;
    bankName: string;
    accountNumber: string;
};

/**
 * Insurance credential information
 */
export type InsuranceInfo = {
    insuranceType: string;
    name: string;
    startDate: string;
    endDate: string;
};

/**
 * Commitment credential information
 */
type Commitment = {
    commitmentId: string;
    commitmentTitle: string;
    commitmentPercentage: number;
    commitmentSupport: string;
    commitmentWalletPercentage: number;
};

/**
 * Future Commitment
 */
export type FutureCommitmentInfo = {
    commitments: Commitment[];
};

/**
 * Present Commitment
 */
export type PresentCommitmentInfo = {
    commitments: Commitment[];
};

/**
 * Credentials (personal, company, bank, insurance)
 */
export type Credentials = {
    [key in CredentialTypes]: {
        heading: string;
        subheading: string;
        data: PersonalInfo;
        channelId?: string;
        password?: string;
    };
};

/**
 * Modal status
 */
export type ModalStatus = {
    active: boolean;
    type: 'share' | 'accept' | 'generate' | null;
    props?: any;
};

export type SocketConnectionState = 'connected' | 'disconnected' | 'registerMobileClient';

type SocketConnection = {
    state: SocketConnectionState;
    payload: any;
};

export const modalStatus = writable<ModalStatus>({ active: false, type: null, props: null });

export const landingIndex = writable<number>(0);

export const activeCredentialForInfo = writable<CredentialTypes>(null);

export const socketConnectionState = writable<SocketConnection>({ state: 'disconnected', payload: null });

export const qrCode = writable<string>('');

export const defaultCredentials: Credentials = {
    personal: {
        heading: 'Home Office',
        subheading: 'My Identity',
        data: null
    },
    immunity: {
        heading: 'Public Health Authority',
        subheading: 'Health Certificate',
        data: null
    },
    visa: {
        heading: 'Foreign Border Agency',
        subheading: 'Travel Visa',
        data: null
    },
    company: {
        heading: 'Company House',
        subheading: 'Business Details',
        data: null
    },
    bank: {
        heading: 'SNS Bank',
        subheading: 'Bank details',
        data: null
    },
    insurance: {
        heading: 'Insurance',
        subheading: 'Insurance details',
        data: null
    },
    futureCommitment: {
        heading: 'The Far Future Foundation',
        subheading: 'Future Commitment',
        data: null
    },
    presentCommitment: {
        heading: 'The Now Foundation',
        subheading: 'Present Commitment',
        data: null
    }
};

export const credentials = writable<Credentials>(cloneDeep(defaultCredentials));

/**
 * Error string
 */
export const error = writable<string>(null);

let errorTimeout: any;

error.subscribe((item) => {
    clearTimeout(errorTimeout);
    if (item) {
        errorTimeout = setTimeout(() => {
            error.set(null);
        }, 3500);
    }
});

import Hammer from 'hammerjs';

import { createCipheriv, createDecipheriv } from 'browserify-aes';
import { writable, Writable } from 'svelte/store';

import {
    AddressData,
    TestResultData,
    PersonalData,
    VisaApplicationData,
    BankData,
    CompanyData,
    InsuranceData,
    FutureCommitmentData,
    PresentCommitmentData,
    ContactDetails
} from '~/lib/identity';
import {
    QRLink,
    PersonalInfo,
    ImmunityInfo,
    VisaInfo,
    InsuranceInfo,
    BankInfo,
    CompanyInfo,
    FutureCommitmentInfo,
    PresentCommitmentInfo
} from '~/lib/store';

import { RANDOM_USER_DATA_API_URL } from '~/lib/config';

/**
 * Random user data
 */
export type RandomUserData = {
    location: {
        street: {
            number: number;
            name: string;
        };
        city: string;
        state: string;
        country: string;
        postcode: number;
    };
    name: {
        first: string;
        last: string;
    };
    phone: string;
    dob: {
        date: string;
        age: string;
    };
    email: string;
    id: {
        value: string;
    };
};

/**
 * Random user data response
 */
export type RandomUserDataResponse = {
    results: RandomUserData[];
};

/**
 * Parses serialised data
 *
 * @method parse
 *
 * @param {string} data
 * @returns {object}
 */
export const parse = (data: string): any => {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

/**
 * Converts byte array to hex
 *
 * @method convertByteArrayToHex
 *
 * @param {Uint8Array} bytes
 *
 * @return {string}
 */
export const convertByteArrayToHex = (bytes: Uint8Array): string => {
    const hex = [];

    /* eslint-disable no-plusplus,no-bitwise */
    for (let i = 0; i < bytes.length; i++) {
        const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xf).toString(16));
    }

    /* eslint-enable no-plusplus,no-bitwise */
    return hex.join('');
};

/**
 * Parses QR link
 *
 * @method parseLink
 *
 * @param {string} link
 *
 * @returns {QRLink}
 */
export const parseLink = (link: string): QRLink => {
    return parse(link) as QRLink;
};

/**
 * Encrypts payload with provided password (key)
 *
 * @method encrypt
 *
 * @param {string} key
 * @param {string} payload
 *
 * @returns {string}
 */
export const encrypt = (key: string, payload: string): string => {
    const IV_LENGTH = 16; // For AES, this is always 16
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(payload);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${convertByteArrayToHex(iv)}:${encrypted.toString('hex')}`;
};

/**
 * Decrypts payload with provided password (key)
 *
 * @method decrypt
 *
 * @param {string} key
 * @param {string} payload
 *
 * @returns {string}
 */
export const decrypt = (key: string, payload: string): string => {
    const textParts = payload.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

/**
 * Updates application path
 *
 * @method goto
 *
 * @param {string} path
 *
 * @returns {void}
 */
export const goto = (path: string): void => {
    window.location.hash = path;
};

/**
 * Synchronous timeout
 *
 * @method delay
 *
 * @param {number} ms
 *
 * @returns {void}
 */
export const delay = (ms: number): void => {
    const startPoint = new Date().getTime();
    while (new Date().getTime() - startPoint <= ms);
};

/**
 * Gets random user data
 *
 * @method getRandomUserData
 *
 * @returns {Promise<UserData>}
 */
export const getRandomUserData = (): Promise<RandomUserData> => {
    return fetch(RANDOM_USER_DATA_API_URL)
        .then((response) => response.json())
        .then((result: RandomUserDataResponse) => {
            const randomData = result.results[0];

            return randomData;
        });
};

/**
 * Prepares personal information
 *
 * @method preparePersonalInformation
 *
 * @param {AddressData} addressData
 * @param {PersonalData} personalData
 * @param {ContactDetails} contactData
 *
 * @returns {PersonalInfo}
 */
export const preparePersonalInformation = (
    addressData: AddressData,
    personalData: PersonalData,
    contactData: ContactDetails
): PersonalInfo => ({
    firstName: personalData.UserPersonalData.UserName.FirstName,
    lastName: personalData.UserPersonalData.UserName.LastName,
    dateOfBirth: personalData.UserPersonalData.UserDOB.Date,
    birthPlace: personalData.UserPersonalData.Birthplace,
    nationality: personalData.UserPersonalData.Nationality,
    countryOfResidence: addressData.UserAddress.Country,
    address: `${addressData.UserAddress.Street} ${addressData.UserAddress.City}, ${addressData.UserAddress.Postcode}`,
    identityCardNumber: personalData.UserPersonalData.IdentityCardNumber,
    passportNumber: personalData.UserPersonalData.PassportNumber,
    phoneNumber: contactData.UserContacts.Phone,
    email: contactData.UserContacts.Email
});

/**
 * Prepares immunity information
 *
 * @method prepareImmunityInformation
 *
 * @param {TestResultData} testResultData
 *
 * @returns {ImmunityInfo}
 */
export const prepareImmunityInformation = (testResultData: TestResultData): ImmunityInfo => ({
    testId: testResultData.TestID,
    testedBy: testResultData.TestBy,
    testTimestamp: testResultData.TestTimestamp,
    testKit: testResultData.TestKit,
    testResult: testResultData.TestResult
});

/**
 * Prepares visa application information
 *
 * @method prepareBankInformation
 *
 * @param {VisaApplicationData} visaApplicationData
 *
 * @returns {VisaInfo}
 */
export const prepareVisaInformation = (visaApplicationData: VisaApplicationData): VisaInfo => ({
    visaApplicationNumber: visaApplicationData.VisaApplicationNumber,
    visaCountry: visaApplicationData.VisaCountry
});

/**
 * Prepares company information
 *
 * @method prepareCompanyInformation
 *
 * @param {CompanyData} companyData
 *
 * @returns {CompanyInfo}
 */
export const prepareCompanyInformation = (companyData: CompanyData): CompanyInfo => ({
    companyName: companyData.CompanyName,
    companyAddress: companyData.CompanyAddress,
    companyType: companyData.CompanyType,
    companyBusiness: companyData.CompanyBusiness,
    companyNumber: companyData.CompanyNumber,
    companyOwner: companyData.CompanyOwner,
    companyStatus: companyData.CompanyStatus,
    companyCreationDate: companyData.CompanyCreationDate
});

/**
 * Prepares bank account information
 *
 * @method prepareBankInformation
 *
 * @param {BankData} bankData
 *
 * @returns {BankInfo}
 */
export const prepareBankInformation = (bankData: BankData): BankInfo => ({
    bankName: bankData.BankName,
    accountNumber: bankData.AccountNumber,
    accountType: bankData.AccountType
});

/**
 * Prepares bank account information
 *
 * @method prepareInsuranceInformation
 *
 * @param {InsuranceData} insuranceData
 *
 * @returns {InsuranceInfo}
 */
export const prepareInsuranceInformation = (insuranceData: InsuranceData): InsuranceInfo => ({
    insuranceType: insuranceData.InsuranceType,
    name: insuranceData.Name,
    startDate: insuranceData.StartDate,
    endDate: insuranceData.EndDate
});

/**
 * Prepares future commitment information
 *
 * @method prepareFutureCommitmentInformation
 *
 * @param {FutureCommitmentData} futureCommitmentData
 *
 * @returns {FutureCommitmentInfo}
 */
export const prepareFutureCommitmentInformation = (futureCommitmentData: FutureCommitmentData): FutureCommitmentInfo => ({
    commitments: futureCommitmentData.Commitments.map((commitment) => ({
        commitmentId: commitment.CommitmentId,
        commitmentTitle: commitment.CommitmentTitle,
        commitmentPercentage: commitment.CommitmentPercentage,
        commitmentSupport: commitment.CommitmentSupport,
        commitmentWalletPercentage: commitment.CommitmentWalletPercentage
    }))
});

/**
 * Prepares present commitment information
 *
 * @method preparePresentCommitmentInformation
 *
 * @param {PresentCommitmentData} presentCommitmentData
 *
 * @returns {PresentCommitmentInfo}
 */
export const preparePresentCommitmentInformation = (presentCommitmentData: PresentCommitmentData): PresentCommitmentInfo => ({
    commitments: presentCommitmentData.Commitments.map((commitment) => ({
        commitmentId: commitment.CommitmentId,
        commitmentTitle: commitment.CommitmentTitle,
        commitmentPercentage: commitment.CommitmentPercentage,
        commitmentSupport: commitment.CommitmentSupport,
        commitmentWalletPercentage: commitment.CommitmentWalletPercentage
    }))
});

/**
 * Detects a swipe gesture and triggers an event
 *
 * @method detectSwipeGesture
 *
 * @param {string} elementId
 * @param {string} swipe
 * @param {function} onSwipe
 *
 * @returns {void}
 */
export const detectSwipeGesture = (elementId: string, swipe: string, onSwipe: () => void): void => {
    if (window.matchMedia('(pointer: coarse)').matches) {
        const hammer = new Hammer(document.getElementById(elementId));
        hammer.get('swipe').set({
            direction: swipe.includes('left') || swipe.includes('right') ? Hammer.DIRECTION_HORIZONTAL : Hammer.DIRECTION_VERTICAL
        });
        hammer.on(swipe, () => {
            onSwipe();
        });
    }
};

/**
 * Persist a writable Svelte store to local storage
 */
export const persistent = <T>(key: string, initialValue: T): Writable<T> => {
    let value = initialValue;

    try {
        const json = localStorage.getItem(key);
        if (json) {
            value = JSON.parse(json);
        }
    } catch (err) {
        console.error(err);
    }

    const state = writable(value);

    state.subscribe(($value): void => {
        localStorage.setItem(key, JSON.stringify($value));
    });

    return state;
};

import React from 'react';
import {beforeEach, describe, expect, it} from '@jest/globals';
import TestDriver from '@airtable/blocks-testing';
import {render, screen} from '@testing-library/react';
import {basicTestFixture} from './basic-test-fixture';
import {ExtensionWithSettings} from "../src/components/ExtensionWithSettings";
import {RateLimiter} from "../src/utils/RateLimiter";
import {AirtableMutationService} from "../src/services/AirtableMutationService";
import {GumroadLicenseVerificationService} from "../src/services/LicenseVerificationService";
import userEvent from '@testing-library/user-event'

describe('ExtensionWithSettings', () => {
    let testDriver;
    const user = userEvent.setup()

    beforeEach(() => {
        testDriver = new TestDriver(basicTestFixture);

        const rateLimiter = new RateLimiter(15, 1000);
        const airtableMutationService = new AirtableMutationService(rateLimiter);
        const licenseVerificationService = new GumroadLicenseVerificationService();

        render(
            <testDriver.Container>
                <ExtensionWithSettings airtableMutationService={airtableMutationService}
                                       licenseVerificationService={licenseVerificationService}/>
            </testDriver.Container>,
        );
    });

    it('should render.', () => {
        screen.getByText('Checkout Cart');
    });

    it('should have tab navigation that works as expected.', async () => {
        expect(screen.getByText('How this extension works:')).toBeTruthy();

        expect(screen.queryByText('You must configure the extension in the settings tab before you can use it!')).toBeNull();
        expect(screen.queryByText('The cart is empty')).toBeNull();
        expect(screen.queryByText('Save Configuration')).toBeNull();

        await user.click(screen.getByText('Settings'));
        expect(await screen.findByText('Save Configuration')).toBeTruthy();

        await user.click(screen.getByText('Premium'));
        expect(await screen.findByText('Upgrade to premium to enable cart sizes larger than 3 items!')).toBeTruthy();

        await user.click(screen.getByText('🛒'));
        expect(await screen.findByText('You must configure the extension in the settings tab before you can use it!')).toBeTruthy();
    });

    it('should have settigns page that works as expected', async () => {
        await user.click(screen.getByText('Settings'));

        await user.click(await screen.findByText('Required Schema (Click to Expand)'));
        await user.click(await screen.findByText('Auto-Generate Required Schema'));
        await user.click(await screen.findByText('Cancel'));

        const inventorySelect = await screen.getByLabelText('Inventory Table:');
        await user.selectOptions(inventorySelect, 'Test Inventory');

        const recipientsSelect = await screen.getByLabelText('Recipient Table:');
        await user.selectOptions(recipientsSelect, 'Test Recipients');

        const checkoutsSelect = await screen.getByLabelText('Checkouts Table (Junction Table):');
        await user.selectOptions(checkoutsSelect, 'Test Checkouts');

        const linkedInventoryField = await screen.findByLabelText('Linked Record Field to Inventory Table:')
        await user.selectOptions(linkedInventoryField, 'Checked Out Item');

        const linkedRecipientField = await screen.findByLabelText('Linked Record Field to Recipients Table:')
        await user.selectOptions(linkedRecipientField, 'Checked Out To');

        const checkedInField = await screen.findByLabelText('Checked In Field:')
        await user.selectOptions(checkedInField, 'Checked In');

        await user.click(await screen.findByText('Save Configuration'));

        await user.click(screen.getByText('🛒'));
        expect(await screen.findByText('The cart is empty')).toBeTruthy();
    })
});
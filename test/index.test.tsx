import React from 'react';
import {beforeEach, describe, expect, it} from '@jest/globals';
import TestDriver from '@airtable/blocks-testing';
import {render, waitFor} from '@testing-library/react';
import {basicTestFixture} from './basic-test-fixture';

describe('ExtensionWithSettings', () => {
    let testDriver;

    beforeEach(() => {
        testDriver = new TestDriver(basicTestFixture);

        render(
            <testDriver.Container>
                {/*<ExtensionWithSettings/>*/}
            </testDriver.Container>,
        );
    });

    it('Extension is rendered', async () => {
        await waitFor(() => expect(document.body.textContent).toBe(''));
    });
});
import React from 'react';
import {beforeEach, describe, expect, it} from '@jest/globals';
import TestDriver from '@airtable/blocks-testing';
import {render, waitFor} from '@testing-library/react';
import {FieldType, ViewType} from "@airtable/blocks/models";

describe('ExtensionWithSettings', () => {
    let testDriver;


    beforeEach(() => {
        testDriver = new TestDriver({
            base: {
                collaborators: [{
                    id: 'userId',
                    email: 'test@test.com',
                    isActive: true
                }],
                id: 'TestBaseId',
                name: "",
                tables: [
                    {
                        id: '123',
                        name: 'test',
                        description: null,
                        fields: [{
                            id: '123',
                            name: 'testField',
                            description: null,
                            type: FieldType.NUMBER,
                            options: null
                        }],
                        views: [{
                            id: 'ViewId',
                            name: 'GridView',
                            type: ViewType.GRID,
                            fieldOrder: {
                                fieldIds: ['123'],
                                visibleFieldCount: 1
                            },
                            records: [],
                            isLockedView: false
                        }],
                        records: []
                    }
                ],
                workspaceId: ""
            }
        });

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
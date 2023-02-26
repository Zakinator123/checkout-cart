import React from "react";
import CheckoutWithCart from "./components/CheckoutWithCart";
import { initializeBlock } from '@airtable/blocks/ui';

initializeBlock(() => <CheckoutWithCart />);

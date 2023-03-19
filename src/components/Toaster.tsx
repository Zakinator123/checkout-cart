import React from "react";
import {Toaster} from "react-hot-toast";

export const Toast = () => (<Toaster
    position="bottom-center"
    reverseOrder={false}
    gutter={8}
    containerClassName=""
    containerStyle={{}}
    toastOptions={{
        // Define default options
        className: '',
        duration: 5000,
        style: {
            background: '#363636',
            color: '#fff',
        },

        // Default options for specific types
        success: {
            duration: 2000,
            style: {
                background: 'green'
            },
        }
    }}
/>);
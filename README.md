# Developer Guide for the SAP Conversational AI WebClient 

The SAP Conversational AI WebClient (further just called WebClient) offers two main ways for developers to interact with it at runtime:

- calling the WebClient API from your business logic
- Implementing the WebClient Bridge API in your web application

The following diagram shows a high level picture of how the WebClient is integrated into a web application and illustrates the two interfaces (WebClient API and WebClient Bridge) and their place in the integration.

![WebClient](./images/webclient.png)

## WebClient API

The WebClient API exposes a public JavaScript API, which is available at runtime in your web application as soon as the WebClient is loaded.

This API is available at the JavaScript object path: `window.sap.cai.webclient`

The API has the following methods:

```
/**
 * Opens the WebClient  
 */
- show()
 
/**
 * Hides the WebClient
 */
- hide()
 
/**
 * Toggles show/hide of the WebClient. This can be attached to an own button in the application in order to toggle display of the WebClient.
 */
- toggle()
 
/**
 * Sets the theme of the WebClient
 *
 * @param {string} themeName The name of the theme to be set
 */
- setTheme(themeName)
 
/**
 * Sends the given message to the underlying bot
 *
 * @param {string} message the string message to send to the WebClient
 */
- sendMessage(message)

/**
 * Sends a final or interim Speech-To-Text transcription result to the WebClient and updates the UI.
 * If the 'final' flag is set to true, the UI will exit the listening mode and will automatically send the text as a message to the bot.
 * If the flag is false the UI will only update the text but will remaining in listening mode.
 *
 * @param {object} result JavaScipt object of the form
 * {
 *    text: 'A string',
 *    final: true | false, 
 * }
 */
- onSTTResult(result)
```

## WebClient Bridge API

The WebClinet Bridge API offers a way to extend or customize the functionality of the WebClient by implementing a defined interface whose methods are called by the WebClient at runtime.

```
/**
 * Returns the unique application ID of your web application. 
 * This can be any computed string that identifies this instance of your application uniquely.
 * An example for a Fiori Launchpad could be 'CCF715', so the name of the underlying ABAP system plus client.
 *
 * The application ID can be referenced in the channel configuration of the Bot Connector
 * in order to assign one or multiple channels to an application ID. 
 * 
 * If you don't use the application ID in your channels, you don't need to implement this method.
 * 
 * @return string The application ID
 */
- getApplicationId() 

/**
* When the SAP Conversational AI Web Client starts using a specific channel,
* it first fetches the preferences as defined in the channel.
* If implemented, the properties returned by this function will 
* overwrite the channel properties.
* 
* @return object or promise resolving to object
* 
*/
- getChannelPreferences()
```
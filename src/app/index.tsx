import { Redirect } from 'expo-router';

/**
 * Root route (/) handler
 * 
 * Redirects to the timeline tab as the home/default screen.
 * This provides a single source of truth for the app's default landing page.
 * 
 * To change the default home screen, simply update the href below.
 * Examples:
 *   href="/overview" - Make overview the default home
 *   href="/dashboard" - Redirect to a different route
 */
export default function Index() {
    return <Redirect href="/timeline" />;
}

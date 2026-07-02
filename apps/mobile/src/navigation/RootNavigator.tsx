import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../shared/context/AuthContext'
import { useLocation } from '../shared/context/LocationContext'

// ── Auth screens (phone verification only — no Stripe here) ───────────────
import { WelcomeScreen } from '../features/auth/WelcomeScreen'
import { PhoneVerifyScreen } from '../features/auth/PhoneVerifyScreen'
import { HandleSetupScreen } from '../features/auth/HandleSetupScreen'

// ── Location setup ────────────────────────────────────────────────────────
import { LocationSetupScreen } from '../features/browse/LocationSetupScreen'

// ── Browse tab ────────────────────────────────────────────────────────────
import { FeedScreen } from '../features/browse/FeedScreen'
import { ListingDetailScreen } from '../features/browse/ListingDetailScreen'

// ── Sell tab ──────────────────────────────────────────────────────────────
import { CameraScreen } from '../features/sell/CameraScreen'
import { ReviewDraftScreen } from '../features/sell/ReviewDraftScreen'
import { PriceLocationScreen } from '../features/sell/PriceLocationScreen'
import { ListingConfirmationScreen } from '../features/sell/ListingConfirmationScreen'

// ── Inbox tab ─────────────────────────────────────────────────────────────
import { ThreadListScreen } from '../features/inbox/ThreadListScreen'
import { ThreadViewScreen } from '../features/inbox/ThreadViewScreen'

// ── Account tab (Stripe Connect lives here, as an optional enhancement) ───
import { AccountHomeScreen } from '../features/account/AccountHomeScreen'
import { MyListingsScreen } from '../features/account/MyListingsScreen'
import { PaymentSetupScreen } from '../features/account/PaymentSetupScreen'
import { NotificationPrefsScreen } from '../features/account/NotificationPrefsScreen'

// ── Tab icons (placeholder — swap with icon library) ──────────────────────
import { Text } from 'react-native'
import { colors } from '../shared/theme/tokens'

// ── Stack param lists ─────────────────────────────────────────────────────

export type RootStackParamList = {
  LocationSetup: undefined
  AppTabs: undefined
  // AuthStack is entered inline from any auth-gated action.
  // returnTo tells the navigator where to go after auth completes.
  AuthStack: { returnTo?: string }
}

// Auth flow is phone verification only.
// StripeConnect is NOT in this stack — it lives in AccountStack.
export type AuthStackParamList = {
  Welcome: { returnTo?: string }
  PhoneVerify: { phone: string; returnTo?: string }
  HandleSetup: { returnTo?: string }
  // DO NOT add StripeConnect here. Auth is complete after HandleSetup.
}

export type AppTabParamList = {
  BrowseStack: undefined
  SellStack: undefined
  InboxStack: undefined
  AccountStack: undefined
}

export type BrowseStackParamList = {
  Feed: undefined
  ListingDetail: { listingId: string }
}

export type SellStackParamList = {
  Camera: undefined
  ReviewDraft: { photoUris: string[] }
  PriceLocation: { draft: object }
  ListingConfirmation: { listingId: string }
}

export type InboxStackParamList = {
  ThreadList: undefined
  ThreadView: { threadId: string; listingTitle: string }
}

export type AccountStackParamList = {
  AccountHome: undefined
  MyListings: undefined
  PaymentSetup: undefined  // Stripe Connect lives here — voluntary, never gated
  NotificationPrefs: undefined
}

// ── Navigators ────────────────────────────────────────────────────────────

const Root = createNativeStackNavigator<RootStackParamList>()
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>()
const Tabs = createBottomTabNavigator<AppTabParamList>()
const BrowseStack = createNativeStackNavigator<BrowseStackParamList>()
const SellStack = createNativeStackNavigator<SellStackParamList>()
const InboxStack = createNativeStackNavigator<InboxStackParamList>()
const AccountStack = createNativeStackNavigator<AccountStackParamList>()

// ── Deep link config ──────────────────────────────────────────────────────

const linking = {
  prefixes: ['kerbdrop://', 'https://kerbdrop.com'],
  config: {
    screens: {
      AppTabs: {
        screens: {
          BrowseStack: {
            screens: {
              ListingDetail: 'listing/:listingId',
            },
          },
          InboxStack: {
            screens: {
              ThreadView: 'inbox/:threadId',
            },
          },
          AccountStack: {
            screens: {
              PaymentSetup: 'payments/setup',
            },
          },
        },
      },
      // Deep link from Stripe OAuth callback returns here
      // kerbdrop://payments/callback?... is handled by the API,
      // which redirects to kerbdrop://account after storing the account ID.
    },
  },
}

// ── Feature navigators ────────────────────────────────────────────────────

function BrowseNavigator() {
  return (
    <BrowseStack.Navigator screenOptions={{ headerShown: false }}>
      <BrowseStack.Screen name="Feed" component={FeedScreen} />
      <BrowseStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </BrowseStack.Navigator>
  )
}

function SellNavigator() {
  return (
    // Modal presentation: the sell flow slides up over the feed,
    // reinforcing that it's a focused task the user can dismiss.
    <SellStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <SellStack.Screen name="Camera" component={CameraScreen} />
      <SellStack.Screen name="ReviewDraft" component={ReviewDraftScreen} />
      <SellStack.Screen name="PriceLocation" component={PriceLocationScreen} />
      <SellStack.Screen name="ListingConfirmation" component={ListingConfirmationScreen} />
    </SellStack.Navigator>
  )
}

function InboxNavigator() {
  return (
    <InboxStack.Navigator screenOptions={{ headerShown: false }}>
      <InboxStack.Screen name="ThreadList" component={ThreadListScreen} />
      <InboxStack.Screen name="ThreadView" component={ThreadViewScreen} />
    </InboxStack.Navigator>
  )
}

function AccountNavigator() {
  return (
    // PaymentSetup (Stripe Connect) is a voluntary screen in this stack.
    // It is reached by tapping a nudge card in AccountHome or navigating
    // explicitly from settings. It is never pushed automatically.
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountHome" component={AccountHomeScreen} />
      <AccountStack.Screen name="MyListings" component={MyListingsScreen} />
      <AccountStack.Screen name="PaymentSetup" component={PaymentSetupScreen} />
      <AccountStack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} />
    </AccountStack.Navigator>
  )
}

function AuthNavigator() {
  // This navigator handles phone verification only.
  // Auth is complete when HandleSetup finishes.
  // Stripe Connect is never part of this flow.
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStackNav.Screen name="PhoneVerify" component={PhoneVerifyScreen} />
      <AuthStackNav.Screen name="HandleSetup" component={HandleSetupScreen} />
    </AuthStackNav.Navigator>
  )
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  // TODO: replace with @expo/vector-icons or similar
  return <Text style={{ fontSize: 10, color: focused ? colors.accent : colors.inkFaint }}>{label}</Text>
}

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkFaint,
      }}
    >
      <Tabs.Screen
        name="BrowseStack"
        component={BrowseNavigator}
        options={{ tabBarLabel: 'Browse', tabBarIcon: ({ focused }) => <TabIcon label="●" focused={focused} /> }}
      />
      <Tabs.Screen
        name="SellStack"
        component={SellNavigator}
        options={{ tabBarLabel: 'Sell', tabBarIcon: ({ focused }) => <TabIcon label="+" focused={focused} /> }}
      />
      <Tabs.Screen
        name="InboxStack"
        component={InboxNavigator}
        options={{ tabBarLabel: 'Inbox', tabBarIcon: ({ focused }) => <TabIcon label="✉" focused={focused} /> }}
      />
      <Tabs.Screen
        name="AccountStack"
        component={AccountNavigator}
        options={{ tabBarLabel: 'Account', tabBarIcon: ({ focused }) => <TabIcon label="⊙" focused={focused} /> }}
      />
    </Tabs.Navigator>
  )
}

// ── Root navigator ────────────────────────────────────────────────────────

export function RootNavigator() {
  const { isLoading } = useAuth()
  const { location } = useLocation()

  // Hold rendering until auth state is resolved.
  // Splash screen is held open by SplashScreen.preventAutoHideAsync() in index.tsx.
  if (isLoading) return null

  return (
    <NavigationContainer linking={linking}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!location ? (
          // First launch: resolve location before showing anything else.
          // LocationSetupScreen hides the splash screen on completion.
          <Root.Screen name="LocationSetup" component={LocationSetupScreen} />
        ) : (
          <>
            {/* Main app — always available, auth is handled inline per action */}
            <Root.Screen name="AppTabs" component={AppTabs} />
            {/* Auth stack — entered from any auth-gated action, returns on completion */}
            <Root.Screen name="AuthStack" component={AuthNavigator} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  )
}

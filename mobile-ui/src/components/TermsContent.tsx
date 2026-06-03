/**
 * Single source of truth for OpenPal's Terms & Conditions copy. Rendered both
 * in the signup flow (so people can read them before creating an account) and
 * from the Profile screen (so a copy is always available afterward).
 */
import React from "react";
import { Text, View } from "react-native";

/** Last time the wording below changed. Shown at the top of the document. */
export const TERMS_LAST_UPDATED = "May 28, 2026";

export function TermsContent() {
  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="text-2xl font-bold tracking-tight text-ink">
          Terms &amp; Conditions
        </Text>
        <Text className="text-xs text-muted">Last updated {TERMS_LAST_UPDATED}</Text>
      </View>

      <Text className="text-sm leading-6 text-ink-2">
        Welcome to OpenPal. OpenPal is a community app that helps students find
        and share rides with other students. By creating an account and using
        OpenPal, you agree to the terms below. Please read them carefully — they
        explain what we do with your information and what you are responsible for.
      </Text>

      <Section title="1. What OpenPal is for">
        OpenPal exists to help students connect with one another to arrange
        rides. The information you share — your name, school, graduation date,
        phone number, posts, and messages — is used to match you with and
        introduce you to other students so you can coordinate trips together.
        That is the purpose of the app, and it is why we ask for these details.
      </Section>

      <Section title="2. We do not sell your information">
        We do not sell your personal information to anyone. We do not trade it,
        rent it, or hand it to advertisers or data brokers. The details you share
        are used only to operate OpenPal and to help other students find you for
        the purpose of arranging rides.
      </Section>

      <Section title="3. We do not make money from OpenPal">
        As of now, OpenPal does not make money from this service. We do not
        charge you to use the app and we do not earn revenue from your data. If
        this ever changes, we will update these terms and let you know before any
        new terms take effect.
      </Section>

      <Section title="4. You are responsible for who you interact with">
        OpenPal helps you discover other students, but we do not vet, verify, or
        vouch for the people you meet through the app. You are responsible for
        knowing who you are interacting with. Use your own judgment, take normal
        safety precautions, and decide for yourself whether to ride with, meet,
        or trust another person. We are not responsible for the conduct of any
        user, and we cannot guarantee that anyone is who they say they are.
      </Section>

      <Section title="5. Sharing your contact details is your choice">
        Choosing to share your phone number or any other contact information with
        other students is entirely your decision. If you share your phone number,
        you do so at your own discretion and at your own risk. We do not take
        responsibility for what happens after you share it, including how another
        person uses or passes along your contact information.
      </Section>

      <Section title="6. Your responsibilities">
        You agree to provide accurate information about yourself, to use OpenPal
        only for arranging rides with other students, and to treat other users
        with respect. You are responsible for your own arrangements, including
        agreeing on pickup times, costs, and any other details directly with the
        other person.
      </Section>

      <Section title="7. Community conduct, reporting, and blocking">
        There is zero tolerance for objectionable content or abusive behavior on
        OpenPal. You agree not to post content that is harassing, threatening,
        hateful, sexually explicit, illegal, or otherwise objectionable, and not
        to abuse other users. If you encounter content or a user that violates
        these terms, use the “Report” option to flag it, or “Block” to instantly
        stop seeing that user and prevent them from contacting you. Reports and
        blocks are sent to us for review, and we may remove content or remove
        users who violate these terms, typically within 24 hours.
      </Section>

      <Section title="8. No warranty">
        OpenPal is provided “as is.” We do our best to keep the app running and
        useful, but we do not promise that it will always be available,
        error-free, or that any ride you arrange will take place. To the extent
        allowed by law, we are not liable for any loss, harm, or damage that
        results from using the app or from interactions with other users.
      </Section>

      <Section title="9. Changes to these terms">
        We may update these terms from time to time. When we make a meaningful
        change, we will update the “last updated” date above and, where
        appropriate, notify you in the app. Continuing to use OpenPal after a
        change means you accept the updated terms.
      </Section>

      <Section title="10. Contact">
        If you have questions about these terms or your information, you can reach
        us through the “Report an issue” option in your profile.
      </Section>

      <Text className="text-xs leading-5 text-muted">
        By creating an account, you confirm that you have read and agree to these
        Terms &amp; Conditions.
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-1.5">
      <Text className="text-base font-semibold text-ink">{title}</Text>
      <Text className="text-sm leading-6 text-ink-2">{children}</Text>
    </View>
  );
}

# Enhance Chatbot UX and Expand Currency Support

## Summary
Improves chatbot user experience with multi-line input support and mobile-optimized keyboard handling, while expanding currency support to 33 currencies including Asian, European, and Latin American markets.

## Changes

### Chatbot UX Enhancements
- **Multi-line input**: Replaced single-line input with auto-resizing textarea (max 120px height)
- **Mobile keyboard optimization**: Double Enter to send on mobile devices, single Enter to send on desktop
- **Desktop keyboard**: Shift+Enter for newlines, Enter alone sends message
- **Currency change detection**: Chatbot now detects and confirms currency changes in conversation

### Currency Support Expansion
- Added 15 new currencies: JPY, CHF, SEK, NOK, DKK, PLN, CZK, HUF, BRL, MXN, INR, CNY, KRW, SGD, HKD, NZD, ZAR, TRY, RUB, AED, EGP, THB, PHP, IDR, MYR, VND
- Removed ILS and SAR (no longer in compression mapping)
- Updated API route schema to include all supported currencies
- Enhanced chatbot prompt with currency change instructions

### Documentation
- Streamlined README and deployment docs for clarity
- Condensed test documentation while preserving key information
- Simplified environment variable setup instructions

## Technical Details

### Implementation Notes
- Mobile detection uses touch capability + screen size (< 640px)
- Textarea auto-resizes using `onInput` handler
- Enter key tracking uses 500ms window for double-tap detection
- Currency codes mapped consistently across API, compression, and UI layers

### File Changes
- `src/components/Chatbot.tsx`: Multi-line input, mobile keyboard handling
- `src/utils/chatbot.ts`: Currency change detection in user confirmations
- `src/app/api/chat/route.ts`: Expanded currency schema (33 currencies)
- `src/utils/compression.ts`: Updated currency code mappings
- `src/utils/currency.ts`: Removed ILS, SAR from supported list
- Documentation files: Simplified and condensed

## Testing
- ✅ Existing tests pass (no test changes required)
- ✅ Chatbot input behavior verified on mobile and desktop
- ✅ Currency compression/decompression works with all 33 currencies
- ✅ Multi-line messages properly handled in conversation flow

## Migration Notes
- **No breaking changes**: All changes are backward compatible
- Existing shared links with old currency codes (ILS, SAR) will default to USD if encountered
- Users can now specify 15 additional currencies via chatbot or currency selector

## Checklist
- [x] Code follows existing patterns and conventions
- [x] No breaking changes introduced
- [x] Documentation updated
- [x] Mobile UX tested
- [x] Currency mappings verified across all layers


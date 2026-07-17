/* @ds-bundle: {"format":4,"namespace":"HeritDesignSystem_14a381","components":[{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"StatCard","sourcePath":"components/data-display/StatCard.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"AppHeader","sourcePath":"components/navigation/AppHeader.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"PublicHeader","sourcePath":"components/navigation/PublicHeader.jsx"}],"sourceHashes":{"components/data-display/Avatar.jsx":"a5ef4f28d55c","components/data-display/Card.jsx":"5b879d016f76","components/data-display/StatCard.jsx":"cf29b1b5c848","components/feedback/Badge.jsx":"1c86dad5906f","components/feedback/Banner.jsx":"0521616fce0b","components/feedback/EmptyState.jsx":"e274b4485fd7","components/feedback/Modal.jsx":"aaeaa94690ad","components/forms/Button.jsx":"cbd0b57369a8","components/forms/Checkbox.jsx":"5dfa9c20abda","components/forms/Input.jsx":"08ad8c3eefe7","components/forms/Radio.jsx":"d2976670a879","components/forms/Select.jsx":"3b063448d3d0","components/forms/Textarea.jsx":"65965aa767be","components/navigation/AppHeader.jsx":"afed65c31fe0","components/navigation/Breadcrumb.jsx":"50f892fe4781","components/navigation/Pagination.jsx":"e11a8301122a","components/navigation/PublicHeader.jsx":"51553af12341","ui_kits/portal/App.jsx":"c9e2a864870d","ui_kits/portal/CfeoiDirectoryScreen.jsx":"a9a8009ef95f","ui_kits/portal/DashboardScreen.jsx":"bbde06d9f9b6","ui_kits/portal/LandingScreen.jsx":"3e94f50c4c7a","ui_kits/portal/ProposalsScreen.jsx":"acfe21851366"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HeritDesignSystem_14a381 = window.HeritDesignSystem_14a381 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data-display/Avatar.jsx
try { (() => {
/** Round user avatar with image fallback to initials on a brand-tinted circle. */
function Avatar({
  src,
  name = '',
  size = 36,
  style
}) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const dim = {
    width: size,
    height: size,
    borderRadius: 'var(--radius-full)'
  };
  if (src) {
    return /*#__PURE__*/React.createElement("img", {
      src: src,
      alt: name,
      style: {
        ...dim,
        objectFit: 'cover',
        border: '2px solid var(--surface-card)',
        boxShadow: 'var(--shadow-nav)',
        ...style
      }
    });
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      ...dim,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--brand-100)',
      color: 'var(--brand-600)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--font-weight-semibold)',
      fontSize: size * 0.4,
      ...style
    }
  }, initials || '?');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
/** Generic bordered surface card — the base container for RFP cards, proposal cards, sidebar widgets. */
function Card({
  children,
  hoverable = false,
  padding = 20,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => hoverable && setHover(true),
    onMouseLeave: () => hoverable && setHover(false),
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding,
      boxShadow: hover ? 'var(--shadow-card)' : 'var(--shadow-nav)',
      transition: 'box-shadow var(--duration-base) var(--ease-standard)',
      cursor: hoverable ? 'pointer' : 'default',
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatCard.jsx
try { (() => {
/** Large number + label tile, used for stat bars and metric summaries (dashboard, EOI inbox counts). */
function StatCard({
  value,
  label,
  tone = 'neutral',
  style
}) {
  const color = tone === 'neutral' ? 'var(--text-primary)' : `var(--status-${tone}-text)`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 18px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '92px',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--font-weight-bold)',
      color
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '10px',
      letterSpacing: 'var(--tracking-wider)',
      textTransform: 'uppercase',
      color: 'var(--text-secondary)',
      fontWeight: 'var(--font-weight-medium)'
    }
  }, label));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
const TONE_MAP = {
  info: {
    bg: 'var(--status-info-bg)',
    text: 'var(--status-info-text)'
  },
  amber: {
    bg: 'var(--status-amber-bg)',
    text: 'var(--status-amber-text)'
  },
  orange: {
    bg: 'var(--status-orange-bg)',
    text: 'var(--status-orange-text)'
  },
  success: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success-text)'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    text: 'var(--status-danger-text)'
  },
  neutral: {
    bg: 'var(--status-neutral-bg)',
    text: 'var(--status-neutral-text)'
  }
};

/** Proposal/CFEOI/EOI status badge. Renders as a rounded pill matched to the lifecycle stage's semantic tone.
 * Ideation/Draft -> neutral, Resourcing/Pending -> info, Submitted -> amber, Under Review -> orange, Approved -> success, Withdrawn/Rejected -> danger.
 */
function Badge({
  children,
  tone = 'neutral',
  icon = null,
  style
}) {
  const c = TONE_MAP[tone] || TONE_MAP.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--font-weight-medium)',
      background: c.bg,
      color: c.text,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
const TONE_MAP = {
  info: {
    bg: 'var(--status-info-bg)',
    text: 'var(--status-info-text)',
    border: 'var(--brand-200)',
    icon: 'fa-circle-info'
  },
  success: {
    bg: 'var(--status-success-bg)',
    text: 'var(--status-success-text)',
    border: '#A7F3D0',
    icon: 'fa-circle-check'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    text: 'var(--status-danger-text)',
    border: '#FECACA',
    icon: 'fa-triangle-exclamation'
  }
};

/** Inline banner for page-level notices — e.g. "This CFEOI is now closed", future-notification placeholders, confirmations. */
function Banner({
  tone = 'info',
  title,
  children,
  style
}) {
  const c = TONE_MAP[tone] || TONE_MAP.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${c.icon}`,
    style: {
      color: c.text,
      marginTop: '2px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: c.text
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--font-weight-semibold)',
      marginBottom: '2px'
    }
  }, title), /*#__PURE__*/React.createElement("div", null, children)));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
/** Dashed-border placeholder card for empty lists ("No proposals yet", "No EOIs submitted"). */
function EmptyState({
  icon,
  title,
  description,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      border: '2px dashed var(--border-default)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      fontFamily: 'var(--font-sans)'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '64px',
      height: '64px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
      color: 'var(--text-secondary)',
      fontSize: '24px'
    }
  }, icon), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 20px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      maxWidth: '360px'
    }
  }, description), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/** Centered confirmation/dialog card with a blurred backdrop — matches the withdraw/close/sign-in modal pattern used throughout the portal. */
function Modal({
  open = true,
  onClose,
  icon,
  tone = 'neutral',
  title,
  description,
  children,
  actions
}) {
  if (!open) return null;
  const iconBg = tone === 'danger' ? 'var(--status-danger-bg)' : 'var(--brand-50)';
  const iconColor = tone === 'danger' ? 'var(--status-danger-text)' : 'var(--color-primary)';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: 'var(--surface-card)',
      width: '100%',
      maxWidth: '420px',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-floating)',
      border: '1px solid var(--border-default)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '56px',
      height: '56px',
      borderRadius: 'var(--radius-full)',
      background: iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: iconColor,
      fontSize: '22px'
    }
  }, icon)), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--font-weight-bold)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, description)), children && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      background: 'var(--surface-page)',
      borderTop: '1px solid var(--border-default)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    }
  }, actions)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZE_STYLES = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--text-sm)'
  },
  md: {
    padding: '10px 16px',
    fontSize: 'var(--text-sm)'
  },
  lg: {
    padding: '14px 28px',
    fontSize: 'var(--text-base)'
  }
};
function variantStyle(variant) {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--surface-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-nav)'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-secondary)',
        border: '1px solid transparent'
      };
    case 'outline':
      return {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '2px solid var(--color-primary)'
      };
    case 'danger':
      return {
        background: 'var(--error-bg)',
        color: 'var(--error-600)',
        border: '1px solid var(--status-danger-bg)'
      };
    default:
      return {
        background: 'var(--color-primary)',
        color: 'var(--text-on-primary)',
        border: '1px solid transparent',
        boxShadow: 'var(--shadow-soft)'
      };
  }
}
function hoverStyle(variant) {
  switch (variant) {
    case 'secondary':
      return {
        background: 'var(--surface-subtle)'
      };
    case 'ghost':
      return {
        color: 'var(--text-primary)',
        background: 'var(--surface-subtle)'
      };
    case 'outline':
      return {
        background: 'var(--brand-50)'
      };
    case 'danger':
      return {
        background: 'var(--status-danger-bg)'
      };
    default:
      return {
        background: 'var(--color-primary-hover)'
      };
  }
}

/** Herit primary UI action. Pill shape is reserved for marketing/public pages; app screens use rounded-lg (radius-md). */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  icon = null,
  disabled = false,
  onClick,
  type = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: pill ? 'var(--radius-full)' : 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)',
    ...SIZE_STYLES[size],
    ...variantStyle(variant),
    ...(hover && !disabled ? hoverStyle(variant) : {}),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    style: base,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Custom checkbox — square, checkmark icon, brand-colored when checked. Used in filter sidebars and confirmation modals. */
function Checkbox({
  label,
  checked,
  onChange,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: '16px',
      height: '16px',
      flexShrink: 0,
      marginTop: '2px',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--color-primary)' : 'var(--surface-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'pointer'
    }
  }, rest)), checked && /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check",
    style: {
      fontSize: '9px',
      color: '#fff'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Single-line text field used across forms (proposal title, search bars, tag input, etc). */
function Input({
  icon = null,
  error = false,
  helpText,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-disabled)',
      display: 'flex'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-sunken)',
      border: `1px solid ${error ? 'var(--status-danger-text)' : focus ? 'var(--color-primary)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      padding: icon ? '10px 14px 10px 38px' : '10px 14px',
      outline: focus ? '2px solid var(--brand-100)' : 'none',
      boxSizing: 'border-box',
      transition: 'border-color var(--duration-base) var(--ease-standard)',
      ...style
    }
  }))), helpText && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--status-danger-text)' : 'var(--text-secondary)'
    }
  }, helpText));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Custom radio button — filled dot when selected. Used for resource-type and single-choice pickers (e.g. CFEOI publish form). */
function Radio({
  label,
  description,
  checked,
  onChange,
  name,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: '16px',
      height: '16px',
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--color-primary)' : 'var(--surface-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    checked: checked,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'pointer'
    }
  }, rest)), checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#fff'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: checked ? 'var(--text-primary)' : 'var(--text-secondary)'
    }
  }, label, description && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-disabled)'
    }
  }, " ", description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native dropdown select styled to match Input — used for organisation pickers, sort order, status filters. */
function Select({
  children,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      width: '100%',
      appearance: 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-sunken)',
      border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '10px 36px 10px 14px',
      outline: focus ? '2px solid var(--brand-100)' : 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      transition: 'border-color var(--duration-base) var(--ease-standard)',
      ...style
    }
  }), children), /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chevron-down",
    style: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '11px',
      color: 'var(--text-secondary)',
      pointerEvents: 'none'
    }
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text field for descriptions/messages. A simplified stand-in for the rich-text editor toolbar seen in the proposal/CFEOI forms — plain textarea, no formatting controls. */
function Textarea({
  rows = 4,
  helpText,
  error = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows
  }, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      width: '100%',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      background: 'var(--surface-sunken)',
      border: `1px solid ${error ? 'var(--status-danger-text)' : focus ? 'var(--color-primary)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      outline: focus ? '2px solid var(--brand-100)' : 'none',
      boxSizing: 'border-box',
      resize: 'vertical',
      lineHeight: 'var(--leading-relaxed)',
      transition: 'border-color var(--duration-base) var(--ease-standard)',
      ...style
    }
  })), helpText && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xs)',
      color: error ? 'var(--status-danger-text)' : 'var(--text-secondary)'
    }
  }, helpText));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/AppHeader.jsx
try { (() => {
/** Authenticated app header — white sticky bar, "H" square logo mark, nav links, primary CTA, avatar menu. Used on every screen once a user signs in. */
function AppHeader({
  links = [],
  userName = 'User',
  avatarSrc,
  onSignOut,
  primaryAction
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-nav)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '32px',
      height: '32px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-primary)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--font-weight-bold)',
      fontSize: 'var(--text-xl)'
    }
  }, "H"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--font-weight-bold)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-primary)'
    }
  }, "Herit")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: '24px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || '#',
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      color: 'var(--text-secondary)',
      textDecoration: 'none'
    }
  }, l.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }
  }, primaryAction, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMenuOpen(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '36px',
      height: '36px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--brand-100)',
      color: 'var(--brand-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--font-weight-semibold)',
      fontSize: 'var(--text-sm)',
      border: '2px solid var(--surface-card)',
      boxShadow: 'var(--shadow-nav)'
    }
  }, avatarSrc ? /*#__PURE__*/React.createElement("img", {
    src: avatarSrc,
    alt: userName,
    style: {
      width: '100%',
      height: '100%',
      borderRadius: 'var(--radius-full)',
      objectFit: 'cover'
    }
  }) : userName.split(' ').map(n => n[0]).slice(0, 2).join('')), /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chevron-down",
    style: {
      fontSize: '10px',
      color: 'var(--text-secondary)'
    }
  })), menuOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 0,
      top: '44px',
      width: '192px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--border-default)',
      padding: '4px 0',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'block',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      textDecoration: 'none'
    }
  }, "My Dashboard"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'block',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      textDecoration: 'none'
    }
  }, "My Proposals"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '1px',
      background: 'var(--border-default)',
      margin: '4px 0'
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: onSignOut,
    style: {
      display: 'block',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)',
      color: 'var(--error-500)',
      textDecoration: 'none'
    }
  }, "Sign Out")))));
}
Object.assign(__ds_scope, { AppHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/AppHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
/** Breadcrumb trail — Home / section / current page, chevron separators, current page bold. */
function Breadcrumb({
  items = []
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      fontSize: 'var(--text-sm)',
      flexWrap: 'wrap'
    }
  }, items.map((item, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, i > 0 && /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-chevron-right",
      style: {
        fontSize: '9px',
        color: 'var(--text-disabled)'
      }
    }), last || !item.href ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: last ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: last ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)'
      }
    }, item.label) : /*#__PURE__*/React.createElement("a", {
      href: item.href,
      style: {
        color: 'var(--text-secondary)',
        textDecoration: 'none'
      }
    }, item.label));
  })));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
/** Numbered pagination control with prev/next chevrons — matches list pages (RFP list, CFEOI directory, EOI inbox). */
function Pagination({
  page = 1,
  pageCount = 1,
  onPageChange
}) {
  const pages = Array.from({
    length: pageCount
  }, (_, i) => i + 1);
  const btn = active => ({
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-weight-medium)',
    border: active ? 'none' : '1px solid var(--border-default)',
    background: active ? 'var(--color-primary)' : 'var(--surface-card)',
    color: active ? 'var(--text-on-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)'
  });
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Pagination",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: btn(false),
    disabled: page === 1,
    onClick: () => onPageChange && onPageChange(page - 1)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chevron-left",
    style: {
      fontSize: '11px'
    }
  })), pages.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    style: btn(p === page),
    onClick: () => onPageChange && onPageChange(p)
  }, p)), /*#__PURE__*/React.createElement("button", {
    style: btn(false),
    disabled: page === pageCount,
    onClick: () => onPageChange && onPageChange(page + 1)
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chevron-right",
    style: {
      fontSize: '11px'
    }
  })));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PublicHeader.jsx
try { (() => {
/** Public/marketing header — translucent white bar, dark pill-shaped nav, globe+wordmark, "Sign In" outline pill button. Used on unauthenticated pages (landing, RFP browse, CFEOI directory). */
function PublicHeader({
  links = [],
  activeLabel,
  onSignIn
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-default)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: 'var(--brand-600)',
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-globe",
    style: {
      fontSize: '20px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xl)',
      fontWeight: 'var(--font-weight-bold)'
    }
  }, "Herit")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      background: 'var(--neutral-900)',
      borderRadius: 'var(--radius-full)',
      padding: '6px 8px',
      gap: '4px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || '#',
    style: {
      padding: '8px 16px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      textDecoration: 'none',
      color: l.label === activeLabel ? '#fff' : '#D1D5DB',
      background: l.label === activeLabel ? 'rgba(255,255,255,0.1)' : 'transparent'
    }
  }, l.label)))), /*#__PURE__*/React.createElement("button", {
    onClick: onSignIn,
    style: {
      padding: '8px 20px',
      borderRadius: 'var(--radius-full)',
      border: '2px solid var(--brand-600)',
      color: 'var(--brand-600)',
      background: 'transparent',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-weight-medium)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)'
    }
  }, "Sign In"));
}
Object.assign(__ds_scope, { PublicHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PublicHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/App.jsx
try { (() => {
const {
  Modal,
  Button
} = window.HeritDesignSystem_14a381;
function App() {
  const [authed, setAuthed] = React.useState(false);
  const [screen, setScreen] = React.useState('landing');
  const [signInOpen, setSignInOpen] = React.useState(false);
  const [eoiOpen, setEoiOpen] = React.useState(false);
  function handleSignIn() {
    setSignInOpen(false);
    setAuthed(true);
    setScreen('dashboard');
  }
  function handleSignOut() {
    setAuthed(false);
    setScreen('landing');
  }
  function navigate(dest) {
    if (!authed && dest !== 'landing') {
      setSignInOpen(true);
      return;
    }
    setScreen(dest);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh'
    }
  }, screen === 'landing' && /*#__PURE__*/React.createElement(LandingScreen, {
    onSignIn: () => setSignInOpen(true),
    onNavigate: navigate
  }), screen === 'dashboard' && /*#__PURE__*/React.createElement(DashboardScreen, {
    onNavigate: navigate,
    onSignOut: handleSignOut
  }), screen === 'proposals' && /*#__PURE__*/React.createElement(ProposalsScreen, {
    onSignOut: handleSignOut
  }), screen === 'cfeoi' && /*#__PURE__*/React.createElement(CfeoiDirectoryScreen, {
    onSignOut: handleSignOut,
    onOpenEoi: () => setEoiOpen(true)
  }), authed && screen !== 'landing' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      display: 'flex',
      gap: '8px',
      background: '#fff',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '8px',
      boxShadow: 'var(--shadow-card)',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: screen === 'dashboard' ? 'primary' : 'ghost',
    onClick: () => setScreen('dashboard')
  }, "Dashboard"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: screen === 'proposals' ? 'primary' : 'ghost',
    onClick: () => setScreen('proposals')
  }, "My Proposals"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: screen === 'cfeoi' ? 'primary' : 'ghost',
    onClick: () => setScreen('cfeoi')
  }, "CFEOI Directory")), signInOpen && /*#__PURE__*/React.createElement(Modal, {
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-lock"
    }),
    title: "Sign in required",
    description: "To express interest in volunteer roles or submit proposals, you need to sign in with your Google account.",
    onClose: () => setSignInOpen(false),
    actions: null
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    style: {
      width: '100%'
    },
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-brands fa-google"
    }),
    onClick: handleSignIn
  }, "Sign in with Google"), /*#__PURE__*/React.createElement(Button, {
    style: {
      width: '100%'
    },
    variant: "secondary",
    onClick: () => setSignInOpen(false)
  }, "Continue browsing"))), eoiOpen && /*#__PURE__*/React.createElement(Modal, {
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-handshake"
    }),
    title: "Express interest?",
    description: "Submitting an Expression of Interest sends a cover note to the proposal owner. This is a prototype \u2014 no EOI will actually be created.",
    onClose: () => setEoiOpen(false),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setEoiOpen(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => setEoiOpen(false)
    }, "Submit EOI"))
  }));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/CfeoiDirectoryScreen.jsx
try { (() => {
const {
  AppHeader,
  Button,
  Badge,
  Input,
  Select,
  Checkbox,
  Pagination,
  Breadcrumb
} = window.HeritDesignSystem_14a381;
const CFEOIS = [{
  title: 'Blockchain Architect',
  org: 'Ministry of Health',
  parent: 'Patient Identity Verification',
  tags: ['Blockchain', 'Cryptography', 'System Architecture'],
  location: 'Remote',
  closes: 'Closes Oct 30'
}, {
  title: 'Healthcare Policy Expert',
  org: 'Ministry of Health',
  parent: 'Patient Identity Verification',
  tags: ['Policy Analysis', 'Data Privacy'],
  location: 'Toronto, CA'
}, {
  title: 'Data Engineer',
  org: 'Dept of Education',
  parent: 'National Curriculum Data Migration',
  tags: ['SQL', 'ETL', 'Python'],
  location: 'Remote'
}];
function CfeoiDirectoryScreen({
  onSignOut,
  onOpenEoi
}) {
  const [page, setPage] = React.useState(1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      background: 'var(--surface-page)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    links: [{
      label: 'Browse RFPs'
    }, {
      label: 'Public Proposals'
    }, {
      label: 'CFEOI Directory'
    }],
    userName: "Alexander Wright",
    onSignOut: onSignOut,
    primaryAction: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-plus"
      })
    }, "Create Proposal")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--surface-card)',
      padding: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'CFEOI Directory'
    }]
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
      display: 'flex',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: '240px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-nav)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 20px',
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, "Filters"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 10px'
    }
  }, "Status"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Open",
    checked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Closed",
    checked: false,
    onChange: () => {}
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 10px'
    }
  }, "Organisation"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Ministry of Health",
    checked: false,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Dept of Education",
    checked: false,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "City Council",
    checked: false,
    onChange: () => {}
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    style: {
      flex: 1
    },
    placeholder: "Search by title or tags\u2026",
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-magnifying-glass"
    })
  }), /*#__PURE__*/React.createElement(Select, {
    style: {
      width: '180px'
    },
    defaultValue: "relevant"
  }, /*#__PURE__*/React.createElement("option", {
    value: "relevant"
  }, "Most Relevant"), /*#__PURE__*/React.createElement("option", {
    value: "newest"
  }, "Newest"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      marginBottom: '24px'
    }
  }, CFEOIS.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '20px',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    style: {
      marginBottom: '10px'
    }
  }, "Open"), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 6px',
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, c.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    className: "fa-regular fa-building"
  }), " ", c.org), /*#__PURE__*/React.createElement("span", null, "Parent: ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--brand-600)'
    }
  }, c.parent))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, c.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      padding: '4px 10px',
      background: 'var(--surface-page)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      minWidth: '140px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 4px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-location-dot"
  }), " ", c.location), c.closes && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-regular fa-calendar"
  }), " ", c.closes), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: onOpenEoi
  }, "View Details"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid var(--border-default)',
      paddingTop: '20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, "Showing 1 to 3 of 24 results"), /*#__PURE__*/React.createElement(Pagination, {
    page: page,
    pageCount: 8,
    onPageChange: setPage
  })))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/CfeoiDirectoryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/DashboardScreen.jsx
try { (() => {
const {
  AppHeader,
  Button,
  EmptyState,
  StatCard
} = window.HeritDesignSystem_14a381;
function DashboardScreen({
  onNavigate,
  onSignOut
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      background: 'var(--surface-page)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    links: [{
      label: 'Browse RFPs'
    }, {
      label: 'Public Proposals'
    }, {
      label: 'CFEOI Directory'
    }],
    userName: "Alexander Wright",
    onSignOut: onSignOut,
    primaryAction: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-plus"
      }),
      onClick: () => onNavigate('proposals')
    }, "Create Proposal")
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--brand-50)',
      border: '1px solid var(--brand-200)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '56px',
      height: '56px',
      borderRadius: 'var(--radius-full)',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid var(--brand-200)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-building-columns",
    style: {
      color: 'var(--color-primary)',
      fontSize: '22px',
      opacity: 0.8
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 4px',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, "Welcome to Herit, Alexander!"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      maxWidth: '520px'
    }
  }, "Your profile is set up. Start browsing active RFPs or submit an Expression of Interest."))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onNavigate('cfeoi')
  }, "Browse RFPs"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => onNavigate('proposals')
  }, "Create a Proposal")), /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-globe",
    style: {
      position: 'absolute',
      right: '-30px',
      bottom: '-40px',
      fontSize: '180px',
      color: 'var(--color-primary)',
      opacity: 0.04
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }
  }, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 16px'
    }
  }, "My Proposals ", /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--surface-subtle)',
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)'
    }
  }, "0")), /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-file-contract"
    }),
    title: "No proposals yet",
    description: "You haven't submitted any proposals. Start by browsing active RFPs or create a new proposal from scratch.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-plus"
      }),
      onClick: () => onNavigate('proposals')
    }, "Start a Proposal")
  })), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 16px'
    }
  }, "My Expressions of Interest ", /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--surface-subtle)',
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 'var(--radius-full)'
    }
  }, "0")), /*#__PURE__*/React.createElement(EmptyState, {
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-handshake"
    }),
    title: "No EOIs submitted",
    description: "Express your interest in contributing to civic projects by submitting an EOI to the directory.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-plus"
      }),
      onClick: () => onNavigate('cfeoi')
    }, "Submit an EOI")
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '52px',
      height: '52px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--brand-100)',
      color: 'var(--brand-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600
    }
  }, "AW"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 'var(--text-base)',
      color: 'var(--text-primary)'
    }
  }, "Alexander Wright"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, "alexander.w@example.com"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-default)',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "Profile Status"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--status-success-text)',
      fontWeight: 500
    }
  }, "Complete")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      fontSize: 'var(--text-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "Member Since"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 500
    }
  }, "April 2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "8",
    label: "Resourcing",
    tone: "info"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "5",
    label: "Submitted",
    tone: "amber"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "6",
    label: "Approved",
    tone: "success"
  }))))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/LandingScreen.jsx
try { (() => {
const {
  PublicHeader,
  Button
} = window.HeritDesignSystem_14a381;
const RFPS = [{
  org: 'Ministry of Health',
  icon: 'fa-building',
  title: 'Digital Health Records Infrastructure Upgrade',
  desc: 'Seeking proposals for the modernization of national health data systems, integrating regional clinics into a unified secure database.'
}, {
  org: 'Department of Education',
  icon: 'fa-landmark',
  title: 'E-Learning Platform Development for Rural Schools',
  desc: 'Development of a low-bandwidth accessible e-learning portal tailored for primary education in remote districts.'
}, {
  org: 'Energy Authority',
  icon: 'fa-bolt',
  title: 'Renewable Micro-grid Feasibility Study',
  desc: 'Comprehensive analysis and planning for solar micro-grid implementations across 50 off-grid communities.'
}];
function LandingScreen({
  onSignIn,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      background: '#fff',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(PublicHeader, {
    links: [{
      label: 'Browse RFPs'
    }, {
      label: 'Public Proposals'
    }, {
      label: 'CFEOI Directory'
    }],
    activeLabel: "Browse RFPs",
    onSignIn: onSignIn
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 24px 64px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--text-6xl)',
      fontWeight: 700,
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--text-primary)',
      maxWidth: '820px',
      margin: '0 auto 24px',
      lineHeight: 1.05
    }
  }, "Empowering diaspora to build a smarter, stronger homeland."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-xl)',
      color: 'var(--text-secondary)',
      maxWidth: '640px',
      margin: '0 auto 40px',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, "A dedicated platform connecting skilled expats with government RFPs, community proposals, and vital volunteer roles."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    pill: true,
    size: "lg",
    onClick: () => onNavigate('cfeoi')
  }, "Browse RFPs"), /*#__PURE__*/React.createElement(Button, {
    pill: true,
    size: "lg",
    variant: "secondary",
    onClick: () => onNavigate('cfeoi')
  }, "Explore Proposals"))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '48px 24px',
      borderTop: '1px solid var(--border-default)',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '1000px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      textAlign: 'center'
    }
  }, [['1,204', 'Active RFPs'], ['850+', 'Public Proposals'], ['3.2k', 'Volunteer Roles'], ['45', 'Gov Departments']].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-4xl)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      fontWeight: 500,
      marginTop: '6px'
    }
  }, l))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '80px 24px',
      maxWidth: '1100px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: 0
    }
  }, "Latest Opportunities"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate('cfeoi');
    },
    style: {
      color: 'var(--brand-600)',
      fontWeight: 500,
      fontSize: 'var(--text-sm)',
      textDecoration: 'none'
    }
  }, "View all RFPs \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    }
  }, RFPS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.title,
    style: {
      background: 'var(--surface-page)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `fa-solid ${r.icon}`,
    style: {
      color: 'var(--text-disabled)'
    }
  }), " ", r.org), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-xl)',
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: '0 0 12px'
    }
  }, r.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--leading-relaxed)'
    }
  }, r.desc))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 24px 96px',
      maxWidth: '800px',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--neutral-900)',
      borderRadius: 'var(--radius-2xl)',
      padding: '64px 40px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-floating)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '64px',
      height: '64px',
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 32px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-lock",
    style: {
      color: '#fff',
      fontSize: '24px'
    }
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: '#fff',
      fontSize: 'var(--text-3xl)',
      fontWeight: 700,
      margin: '0 0 16px'
    }
  }, "Ready to make an impact?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#D1D5DB',
      fontSize: 'var(--text-lg)',
      margin: '0 0 40px'
    }
  }, "Sign in to submit proposals, apply for roles, and track your civic contributions."), /*#__PURE__*/React.createElement("button", {
    onClick: onSignIn,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px 32px',
      background: '#fff',
      color: 'var(--text-primary)',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      fontWeight: 600,
      fontSize: 'var(--text-base)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-brands fa-google"
  }), " Continue with Google"))), /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--border-default)',
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-sm)'
    }
  }, "\xA9 2026 Herit Civic Platform. All rights reserved."));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/LandingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/portal/ProposalsScreen.jsx
try { (() => {
const {
  AppHeader,
  Button,
  Badge,
  Input,
  StatCard
} = window.HeritDesignSystem_14a381;
const GROUPS = [{
  status: 'Resourcing',
  tone: 'info',
  items: [{
    title: 'Blockchain Identity Verification Pilot',
    desc: 'Implementing decentralized identity nodes across 3 regional hospitals.',
    visibility: 'Public'
  }, {
    title: 'EHR Interoperability Framework',
    desc: 'Standardizing data exchange protocols between legacy systems and new nodes.',
    visibility: 'Shared'
  }]
}, {
  status: 'Submitted',
  tone: 'amber',
  items: [{
    title: 'Secure Patient Portal V2',
    desc: 'Frontend revamp focusing on accessibility and zero-knowledge proof integration.',
    visibility: 'Public'
  }]
}, {
  status: 'Under Review',
  tone: 'orange',
  items: [{
    title: 'Smart Contract Audit Protocol',
    desc: 'Establishing automated verification for medical record access contracts.',
    visibility: 'Public'
  }]
}];
function ProposalsScreen({
  onSignOut
}) {
  const [tab, setTab] = React.useState('All');
  const tabs = ['All', 'Resourcing', 'Submitted', 'Under Review', 'Approved', 'Withdrawn'];
  const counts = {
    All: 4,
    Resourcing: 2,
    Submitted: 1,
    'Under Review': 1,
    Approved: 0,
    Withdrawn: 0
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      background: 'var(--surface-page)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    links: [{
      label: 'Browse RFPs'
    }, {
      label: 'Public Proposals'
    }, {
      label: 'CFEOI Directory'
    }],
    userName: "Alexander Wright",
    onSignOut: onSignOut,
    primaryAction: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement("i", {
        className: "fa-solid fa-plus"
      })
    }, "Create Proposal")
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: 'flex',
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("section", {
    style: {
      flex: 1,
      borderRight: '1px solid var(--border-default)',
      background: 'var(--surface-card)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      padding: '24px 32px',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-2xl)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, "My Proposals"), /*#__PURE__*/React.createElement(Input, {
    style: {
      width: '240px'
    },
    placeholder: "Search proposals...",
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-magnifying-glass"
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 32px',
      display: 'flex',
      gap: '6px',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--surface-page)',
      flexWrap: 'wrap'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      padding: '7px 14px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      background: tab === t ? '#fff' : 'transparent',
      color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
      boxShadow: tab === t ? 'var(--shadow-nav)' : 'none'
    }
  }, t, " ", /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: '6px',
      fontSize: '11px',
      color: 'var(--text-disabled)'
    }
  }, counts[t])))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '28px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }
  }, GROUPS.filter(g => tab === 'All' || g.status === tab).map(g => /*#__PURE__*/React.createElement("div", {
    key: g.status
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-xs)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      fontWeight: 700,
      color: 'var(--text-disabled)',
      margin: '0 0 12px'
    }
  }, g.status), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  }, g.items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.title,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-nav)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, it.title), /*#__PURE__*/React.createElement(Badge, {
    tone: g.tone
  }, g.status)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, it.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-check-circle"
  }), " Visibility: ", it.visibility)))))))), /*#__PURE__*/React.createElement("aside", {
    style: {
      width: '360px',
      flexShrink: 0,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    style: {
      width: '100%'
    },
    icon: /*#__PURE__*/React.createElement("i", {
      className: "fa-solid fa-plus"
    })
  }, "Create New Proposal"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 0 16px',
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "fa-solid fa-chart-pie",
    style: {
      color: 'var(--text-disabled)'
    }
  }), " Proposal Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-4xl)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, "4"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)'
    }
  }, "Total Active")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "2",
    label: "Resourcing",
    tone: "info"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "1",
    label: "Submitted",
    tone: "amber"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "1",
    label: "Under Review",
    tone: "orange"
  }))))));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portal/ProposalsScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.AppHeader = __ds_scope.AppHeader;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.PublicHeader = __ds_scope.PublicHeader;

})();

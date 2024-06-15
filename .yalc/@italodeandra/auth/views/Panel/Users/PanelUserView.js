"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var AuthContext_1 = require("../../../AuthContext");
var useTranslation_1 = __importDefault(require("@italodeandra/ui/hooks/useTranslation"));
var next_seo_1 = require("next-seo");
var Breadcrumbs_1 = __importDefault(require("@italodeandra/ui/components/Breadcrumbs"));
var Input_1 = __importDefault(require("@italodeandra/ui/components/Input"));
var router_1 = require("next/router");
var get_1 = require("../../../api/panel/user/get");
var react_hook_form_1 = require("react-hook-form");
var emailRegExp_1 = __importDefault(require("@italodeandra/ui/utils/emailRegExp"));
var User_1 = require("../../../collections/user/User");
var User_service_1 = require("../../../collections/user/User.service");
var Button_1 = __importDefault(require("@italodeandra/ui/components/Button"));
var update_1 = require("../../../api/panel/user/update");
var create_1 = require("../../../api/panel/user/create");
var react_use_1 = require("react-use");
var notifications_state_1 = require("@italodeandra/ui/components/Notifications/notifications.state");
function PanelUserView(_a) {
    var _b;
    var customFields = _a.customFields;
    var _c = (0, AuthContext_1.useAuthContext)(), Routes = _c.Routes, intl = _c.intl;
    var t = (0, useTranslation_1.default)(intl);
    var router = (0, router_1.useRouter)();
    var _id = router.query.id;
    var isNew = ["new", "novo"].includes(_id);
    var _d = (0, get_1.useAuthPanelUserGet)(!isNew
        ? {
            _id: _id,
        }
        : undefined), user = _d.data, isLoading = _d.isLoading, isFetching = _d.isFetching;
    var title = isNew ? t("New user") : (user === null || user === void 0 ? void 0 : user.email) || t("User");
    var pages = (0, react_1.useMemo)(function () { return [
        { title: t("Users"), href: Routes.PanelUsers },
        { title: title, loading: !isNew && isLoading },
    ]; }, [Routes.PanelUsers, isLoading, isNew, t, title]);
    var form = (0, react_hook_form_1.useForm)();
    var register = form.register, handleSubmit = form.handleSubmit, errors = form.formState.errors, setError = form.setError, reset = form.reset, watch = form.watch;
    (0, react_1.useEffect)(function () {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                type: user.type,
                customData: user.customData,
            });
        }
        else {
            reset({
                type: User_1.UserType.NORMAL,
            });
        }
    }, [reset, user]);
    var _e = (0, update_1.useAuthPanelUserUpdate)({
        onError: function (err) {
            if (err.status === "Existing") {
                setError("email", {
                    message: t("An user with the same email already exists"),
                });
                return;
            }
            console.error(err);
            (0, notifications_state_1.showNotification)({
                title: t("It was not possible to update the user"),
                message: t("There was an unexpected error. Try again later."),
                icon: "error",
            });
        },
    }), update = _e.mutate, isUpdating = _e.isLoading, isUpdated = _e.isSuccess, resetUpdate = _e.reset;
    var _f = (0, create_1.useAuthPanelUserCreate)({
        onSuccess: function (data) {
            void router.push(Routes.PanelUser(data._id));
        },
        onError: function (err) {
            if (err.status === "Existing") {
                setError("email", {
                    message: t("An user with the same email already exists"),
                });
                return;
            }
            console.error(err);
            (0, notifications_state_1.showNotification)({
                title: t("It was not possible to create the user"),
                message: t("There was an unexpected error. Try again later."),
                icon: "error",
            });
        },
    }), create = _f.mutate, isCreating = _f.isLoading, isCreated = _f.isSuccess, resetCreate = _f.reset;
    (0, react_use_1.useDeepCompareEffect)(function () {
        resetUpdate();
        resetCreate();
    }, [watch(), resetUpdate, resetCreate]);
    var isSubmitting = isUpdating || isCreating;
    var isSaved = isUpdated || isCreated;
    var isLoadingFields = !isNew && isLoading;
    function onSubmit(values) {
        if (!isSubmitting) {
            if (!isNew) {
                void update(__assign({ _id: _id }, values));
            }
            else {
                void create(values);
            }
        }
    }
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "md:px-2" }, { children: [(0, jsx_runtime_1.jsx)(next_seo_1.NextSeo, { title: title }), (0, jsx_runtime_1.jsx)("form", __assign({ onSubmit: handleSubmit(onSubmit) }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "mx-auto w-full max-w-screen-lg" }, { children: [(0, jsx_runtime_1.jsx)(Breadcrumbs_1.default, { pages: pages, className: "col-span-2 mb-4", loading: isFetching }), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "flex flex-col gap-4 px-2 sm:grid sm:grid-cols-2 md:px-0" }, { children: [(0, jsx_runtime_1.jsx)(Input_1.default, __assign({ label: t("Email"), type: "email", required: true }, register("email", {
                                    required: t("Please fill with an email"),
                                    pattern: {
                                        value: emailRegExp_1.default,
                                        message: t("Please fill with a valid email"),
                                    },
                                }), { error: !!errors.email, helpText: (_b = errors.email) === null || _b === void 0 ? void 0 : _b.message, loading: isLoadingFields })), (0, jsx_runtime_1.jsx)(Input_1.default, __assign({ label: t("Name") }, register("name"), { loading: isLoadingFields })), (0, jsx_runtime_1.jsx)(Input_1.default, __assign({ select: true, label: t("Type"), required: true }, register("type"), { loading: isLoadingFields }, { children: Object.values(User_1.UserType).map(function (type) { return ((0, jsx_runtime_1.jsx)("option", __assign({ value: type }, { children: t((0, User_service_1.translateUserType)(type)) }), type)); }) })), customFields === null || customFields === void 0 ? void 0 : customFields(form, isLoadingFields), (0, jsx_runtime_1.jsx)("div", __assign({ className: "col-span-2 grid justify-items-end border-t border-zinc-200 pt-4 dark:border-zinc-800" }, { children: !isSaved ? ((0, jsx_runtime_1.jsx)(Button_1.default, __assign({ type: "submit", loading: isSubmitting || isLoadingFields, variant: "filled", color: "primary" }, { children: t("Save") }))) : ((0, jsx_runtime_1.jsx)(Button_1.default, __assign({ type: "submit", loading: isSubmitting || isLoadingFields, variant: "filled", color: "success" }, { children: t("Saved") }))) }))] }))] })) }))] })));
}
exports.default = PanelUserView;

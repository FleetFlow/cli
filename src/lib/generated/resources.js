export const resources = Object.freeze(
[
  {
    "id": "ai_agent_threads",
    "command": "ai_agent_threads",
    "segments": [
      "ai_agent_threads"
    ],
    "label": "ai agent threads",
    "parentArgs": []
  },
  {
    "id": "articles",
    "command": "articles",
    "segments": [
      "articles"
    ],
    "label": "articles",
    "parentArgs": []
  },
  {
    "id": "articles/reviews",
    "command": "articles reviews",
    "segments": [
      "articles",
      "reviews"
    ],
    "label": "articles reviews",
    "parentArgs": [
      {
        "name": "article_uuid",
        "description": "articles UUID"
      }
    ]
  },
  {
    "id": "assistants",
    "command": "assistants",
    "segments": [
      "assistants"
    ],
    "label": "assistants",
    "parentArgs": []
  },
  {
    "id": "clans",
    "command": "clans",
    "segments": [
      "clans"
    ],
    "label": "clans",
    "parentArgs": []
  },
  {
    "id": "collections",
    "command": "collections",
    "segments": [
      "collections"
    ],
    "label": "collections",
    "parentArgs": []
  },
  {
    "id": "components",
    "command": "components",
    "segments": [
      "components"
    ],
    "label": "components",
    "parentArgs": []
  },
  {
    "id": "components/common_issues",
    "command": "components common_issues",
    "segments": [
      "components",
      "common_issues"
    ],
    "label": "components common issues",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "components/compatibility",
    "command": "components compatibility",
    "segments": [
      "components",
      "compatibility"
    ],
    "label": "components compatibility",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "components/dependencies",
    "command": "components dependencies",
    "segments": [
      "components",
      "dependencies"
    ],
    "label": "components dependencies",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "components/firmwares",
    "command": "components firmwares",
    "segments": [
      "components",
      "firmwares"
    ],
    "label": "components firmwares",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "components/firmwares/changelogs",
    "command": "components firmwares changelogs",
    "segments": [
      "components",
      "firmwares",
      "changelogs"
    ],
    "label": "components firmwares changelogs",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      },
      {
        "name": "firmware_uuid",
        "description": "firmwares UUID"
      }
    ]
  },
  {
    "id": "components/metadata",
    "command": "components metadata",
    "segments": [
      "components",
      "metadata"
    ],
    "label": "components metadata",
    "parentArgs": [
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "customer_issue_category_profiles",
    "command": "customer_issue_category_profiles",
    "segments": [
      "customer_issue_category_profiles"
    ],
    "label": "customer issue category profiles",
    "parentArgs": []
  },
  {
    "id": "customer_metadata",
    "command": "customer_metadata",
    "segments": [
      "customer_metadata"
    ],
    "label": "customer metadata",
    "parentArgs": []
  },
  {
    "id": "customer_usage",
    "command": "customer_usage",
    "segments": [
      "customer_usage"
    ],
    "label": "customer usage",
    "parentArgs": []
  },
  {
    "id": "customers",
    "command": "customers",
    "segments": [
      "customers"
    ],
    "label": "customers",
    "parentArgs": []
  },
  {
    "id": "customers/addresses",
    "command": "customers addresses",
    "segments": [
      "customers",
      "addresses"
    ],
    "label": "customers addresses",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/clans",
    "command": "customers clans",
    "segments": [
      "customers",
      "clans"
    ],
    "label": "customers clans",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/events",
    "command": "customers events",
    "segments": [
      "customers",
      "events"
    ],
    "label": "customers events",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/friendships",
    "command": "customers friendships",
    "segments": [
      "customers",
      "friendships"
    ],
    "label": "customers friendships",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/metadata",
    "command": "customers metadata",
    "segments": [
      "customers",
      "metadata"
    ],
    "label": "customers metadata",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/notifications",
    "command": "customers notifications",
    "segments": [
      "customers",
      "notifications"
    ],
    "label": "customers notifications",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/oauth_applications",
    "command": "customers oauth_applications",
    "segments": [
      "customers",
      "oauth_applications"
    ],
    "label": "customers oauth applications",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/ownership_requests",
    "command": "customers ownership_requests",
    "segments": [
      "customers",
      "ownership_requests"
    ],
    "label": "customers ownership requests",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/sessions",
    "command": "customers sessions",
    "segments": [
      "customers",
      "sessions"
    ],
    "label": "customers sessions",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/subscriptions",
    "command": "customers subscriptions",
    "segments": [
      "customers",
      "subscriptions"
    ],
    "label": "customers subscriptions",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/subscriptions/events",
    "command": "customers subscriptions events",
    "segments": [
      "customers",
      "subscriptions",
      "events"
    ],
    "label": "customers subscriptions events",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      },
      {
        "name": "subscription_uuid",
        "description": "subscriptions UUID"
      }
    ]
  },
  {
    "id": "customers/vehicle_invitations",
    "command": "customers vehicle_invitations",
    "segments": [
      "customers",
      "vehicle_invitations"
    ],
    "label": "customers vehicle invitations",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "customers/vehicles",
    "command": "customers vehicles",
    "segments": [
      "customers",
      "vehicles"
    ],
    "label": "customers vehicles",
    "parentArgs": [
      {
        "name": "customer_uuid",
        "description": "customers UUID"
      }
    ]
  },
  {
    "id": "diagnostic_profiles",
    "command": "diagnostic_profiles",
    "segments": [
      "diagnostic_profiles"
    ],
    "label": "diagnostic profiles",
    "parentArgs": []
  },
  {
    "id": "diagnostic_profiles/steps",
    "command": "diagnostic_profiles steps",
    "segments": [
      "diagnostic_profiles",
      "steps"
    ],
    "label": "diagnostic profiles steps",
    "parentArgs": [
      {
        "name": "diagnostic_profile_uuid",
        "description": "diagnostic profiles UUID"
      }
    ]
  },
  {
    "id": "integrations/stripe/payment_methods",
    "command": "integrations stripe payment_methods",
    "segments": [
      "integrations",
      "stripe",
      "payment_methods"
    ],
    "label": "integrations stripe payment methods",
    "parentArgs": [
      {
        "name": "integration_uuid",
        "description": "integrations UUID"
      },
      {
        "name": "stripe_uuid",
        "description": "stripe UUID"
      }
    ]
  },
  {
    "id": "integrations/stripe/persons",
    "command": "integrations stripe persons",
    "segments": [
      "integrations",
      "stripe",
      "persons"
    ],
    "label": "integrations stripe persons",
    "parentArgs": [
      {
        "name": "integration_uuid",
        "description": "integrations UUID"
      },
      {
        "name": "stripe_uuid",
        "description": "stripe UUID"
      }
    ]
  },
  {
    "id": "locations",
    "command": "locations",
    "segments": [
      "locations"
    ],
    "label": "locations",
    "parentArgs": []
  },
  {
    "id": "maintenance_profiles",
    "command": "maintenance_profiles",
    "segments": [
      "maintenance_profiles"
    ],
    "label": "maintenance profiles",
    "parentArgs": []
  },
  {
    "id": "mobile_applications",
    "command": "mobile_applications",
    "segments": [
      "mobile_applications"
    ],
    "label": "mobile applications",
    "parentArgs": []
  },
  {
    "id": "mobile_applications/events",
    "command": "mobile_applications events",
    "segments": [
      "mobile_applications",
      "events"
    ],
    "label": "mobile applications events",
    "parentArgs": [
      {
        "name": "mobile_application_uuid",
        "description": "mobile applications UUID"
      }
    ]
  },
  {
    "id": "mobile_applications/releases",
    "command": "mobile_applications releases",
    "segments": [
      "mobile_applications",
      "releases"
    ],
    "label": "mobile applications releases",
    "parentArgs": [
      {
        "name": "mobile_application_uuid",
        "description": "mobile applications UUID"
      }
    ]
  },
  {
    "id": "mobile_applications/releases/symbols",
    "command": "mobile_applications releases symbols",
    "segments": [
      "mobile_applications",
      "releases",
      "symbols"
    ],
    "label": "mobile applications releases symbols",
    "parentArgs": [
      {
        "name": "mobile_application_uuid",
        "description": "mobile applications UUID"
      },
      {
        "name": "releas_uuid",
        "description": "releases UUID"
      }
    ]
  },
  {
    "id": "mobile_applications/sessions",
    "command": "mobile_applications sessions",
    "segments": [
      "mobile_applications",
      "sessions"
    ],
    "label": "mobile applications sessions",
    "parentArgs": [
      {
        "name": "mobile_application_uuid",
        "description": "mobile applications UUID"
      }
    ]
  },
  {
    "id": "models",
    "command": "models",
    "segments": [
      "models"
    ],
    "label": "models",
    "parentArgs": []
  },
  {
    "id": "models/bom",
    "command": "models bom",
    "segments": [
      "models",
      "bom"
    ],
    "label": "models bom",
    "parentArgs": [
      {
        "name": "model_uuid",
        "description": "models UUID"
      }
    ]
  },
  {
    "id": "models/diagnostic_profiles",
    "command": "models diagnostic_profiles",
    "segments": [
      "models",
      "diagnostic_profiles"
    ],
    "label": "models diagnostic profiles",
    "parentArgs": [
      {
        "name": "model_uuid",
        "description": "models UUID"
      }
    ]
  },
  {
    "id": "models/metadata",
    "command": "models metadata",
    "segments": [
      "models",
      "metadata"
    ],
    "label": "models metadata",
    "parentArgs": [
      {
        "name": "model_uuid",
        "description": "models UUID"
      }
    ]
  },
  {
    "id": "models/variants",
    "command": "models variants",
    "segments": [
      "models",
      "variants"
    ],
    "label": "models variants",
    "parentArgs": [
      {
        "name": "model_uuid",
        "description": "models UUID"
      }
    ]
  },
  {
    "id": "oauth_applications",
    "command": "oauth_applications",
    "segments": [
      "oauth_applications"
    ],
    "label": "oauth applications",
    "parentArgs": []
  },
  {
    "id": "oauth_applications/allowed_origins",
    "command": "oauth_applications allowed_origins",
    "segments": [
      "oauth_applications",
      "allowed_origins"
    ],
    "label": "oauth applications allowed origins",
    "parentArgs": [
      {
        "name": "oauth_application_uuid",
        "description": "oauth applications UUID"
      }
    ]
  },
  {
    "id": "oauth_applications/redirect_uris",
    "command": "oauth_applications redirect_uris",
    "segments": [
      "oauth_applications",
      "redirect_uris"
    ],
    "label": "oauth applications redirect uris",
    "parentArgs": [
      {
        "name": "oauth_application_uuid",
        "description": "oauth applications UUID"
      }
    ]
  },
  {
    "id": "oauth_applications/return_urls",
    "command": "oauth_applications return_urls",
    "segments": [
      "oauth_applications",
      "return_urls"
    ],
    "label": "oauth applications return urls",
    "parentArgs": [
      {
        "name": "oauth_application_uuid",
        "description": "oauth applications UUID"
      }
    ]
  },
  {
    "id": "orders",
    "command": "orders",
    "segments": [
      "orders"
    ],
    "label": "orders",
    "parentArgs": []
  },
  {
    "id": "orders/line_items",
    "command": "orders line_items",
    "segments": [
      "orders",
      "line_items"
    ],
    "label": "orders line items",
    "parentArgs": [
      {
        "name": "order_uuid",
        "description": "orders UUID"
      }
    ]
  },
  {
    "id": "partners",
    "command": "partners",
    "segments": [
      "partners"
    ],
    "label": "partners",
    "parentArgs": []
  },
  {
    "id": "partners/orders",
    "command": "partners orders",
    "segments": [
      "partners",
      "orders"
    ],
    "label": "partners orders",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      }
    ]
  },
  {
    "id": "partners/orders/components",
    "command": "partners orders components",
    "segments": [
      "partners",
      "orders",
      "components"
    ],
    "label": "partners orders components",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      },
      {
        "name": "order_uuid",
        "description": "orders UUID"
      }
    ]
  },
  {
    "id": "partners/return_items",
    "command": "partners return_items",
    "segments": [
      "partners",
      "return_items"
    ],
    "label": "partners return items",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      }
    ]
  },
  {
    "id": "partners/return_shipments",
    "command": "partners return_shipments",
    "segments": [
      "partners",
      "return_shipments"
    ],
    "label": "partners return shipments",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      }
    ]
  },
  {
    "id": "partners/return_shipments/components",
    "command": "partners return_shipments components",
    "segments": [
      "partners",
      "return_shipments",
      "components"
    ],
    "label": "partners return shipments components",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      },
      {
        "name": "return_shipment_uuid",
        "description": "return shipments UUID"
      }
    ]
  },
  {
    "id": "partners/users",
    "command": "partners users",
    "segments": [
      "partners",
      "users"
    ],
    "label": "partners users",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      }
    ]
  },
  {
    "id": "partners/vehicles",
    "command": "partners vehicles",
    "segments": [
      "partners",
      "vehicles"
    ],
    "label": "partners vehicles",
    "parentArgs": [
      {
        "name": "partner_uuid",
        "description": "partners UUID"
      }
    ]
  },
  {
    "id": "products",
    "command": "products",
    "segments": [
      "products"
    ],
    "label": "products",
    "parentArgs": []
  },
  {
    "id": "products/variants",
    "command": "products variants",
    "segments": [
      "products",
      "variants"
    ],
    "label": "products variants",
    "parentArgs": [
      {
        "name": "product_uuid",
        "description": "products UUID"
      }
    ]
  },
  {
    "id": "products/variants/prices",
    "command": "products variants prices",
    "segments": [
      "products",
      "variants",
      "prices"
    ],
    "label": "products variants prices",
    "parentArgs": [
      {
        "name": "product_uuid",
        "description": "products UUID"
      },
      {
        "name": "variant_uuid",
        "description": "variants UUID"
      }
    ]
  },
  {
    "id": "recalls",
    "command": "recalls",
    "segments": [
      "recalls"
    ],
    "label": "recalls",
    "parentArgs": []
  },
  {
    "id": "recalls/components",
    "command": "recalls components",
    "segments": [
      "recalls",
      "components"
    ],
    "label": "recalls components",
    "parentArgs": [
      {
        "name": "recall_uuid",
        "description": "recalls UUID"
      }
    ]
  },
  {
    "id": "recalls/vehicles",
    "command": "recalls vehicles",
    "segments": [
      "recalls",
      "vehicles"
    ],
    "label": "recalls vehicles",
    "parentArgs": [
      {
        "name": "recall_uuid",
        "description": "recalls UUID"
      }
    ]
  },
  {
    "id": "rides",
    "command": "rides",
    "segments": [
      "rides"
    ],
    "label": "rides",
    "parentArgs": []
  },
  {
    "id": "roles",
    "command": "roles",
    "segments": [
      "roles"
    ],
    "label": "roles",
    "parentArgs": []
  },
  {
    "id": "service_tickets",
    "command": "service_tickets",
    "segments": [
      "service_tickets"
    ],
    "label": "service tickets",
    "parentArgs": []
  },
  {
    "id": "service_tickets/logs",
    "command": "service_tickets logs",
    "segments": [
      "service_tickets",
      "logs"
    ],
    "label": "service tickets logs",
    "parentArgs": [
      {
        "name": "service_ticket_uuid",
        "description": "service tickets UUID"
      }
    ]
  },
  {
    "id": "service_tickets/products",
    "command": "service_tickets products",
    "segments": [
      "service_tickets",
      "products"
    ],
    "label": "service tickets products",
    "parentArgs": [
      {
        "name": "service_ticket_uuid",
        "description": "service tickets UUID"
      }
    ]
  },
  {
    "id": "services",
    "command": "services",
    "segments": [
      "services"
    ],
    "label": "services",
    "parentArgs": []
  },
  {
    "id": "subscriptions",
    "command": "subscriptions",
    "segments": [
      "subscriptions"
    ],
    "label": "subscriptions",
    "parentArgs": []
  },
  {
    "id": "subscriptions/prices",
    "command": "subscriptions prices",
    "segments": [
      "subscriptions",
      "prices"
    ],
    "label": "subscriptions prices",
    "parentArgs": [
      {
        "name": "subscription_uuid",
        "description": "subscriptions UUID"
      }
    ]
  },
  {
    "id": "subscriptions/vouchers",
    "command": "subscriptions vouchers",
    "segments": [
      "subscriptions",
      "vouchers"
    ],
    "label": "subscriptions vouchers",
    "parentArgs": [
      {
        "name": "subscription_uuid",
        "description": "subscriptions UUID"
      }
    ]
  },
  {
    "id": "test_rides",
    "command": "test_rides",
    "segments": [
      "test_rides"
    ],
    "label": "test rides",
    "parentArgs": []
  },
  {
    "id": "threads",
    "command": "threads",
    "segments": [
      "threads"
    ],
    "label": "threads",
    "parentArgs": []
  },
  {
    "id": "threads/messages",
    "command": "threads messages",
    "segments": [
      "threads",
      "messages"
    ],
    "label": "threads messages",
    "parentArgs": [
      {
        "name": "thread_uuid",
        "description": "threads UUID"
      }
    ]
  },
  {
    "id": "translations",
    "command": "translations",
    "segments": [
      "translations"
    ],
    "label": "translations",
    "parentArgs": []
  },
  {
    "id": "translations/keys",
    "command": "translations keys",
    "segments": [
      "translations",
      "keys"
    ],
    "label": "translations keys",
    "parentArgs": [
      {
        "name": "translation_uuid",
        "description": "translations UUID"
      }
    ]
  },
  {
    "id": "users",
    "command": "users",
    "segments": [
      "users"
    ],
    "label": "users",
    "parentArgs": []
  },
  {
    "id": "users/roles",
    "command": "users roles",
    "segments": [
      "users",
      "roles"
    ],
    "label": "users roles",
    "parentArgs": [
      {
        "name": "user_uuid",
        "description": "users UUID"
      }
    ]
  },
  {
    "id": "vehicle_imports",
    "command": "vehicle_imports",
    "segments": [
      "vehicle_imports"
    ],
    "label": "vehicle imports",
    "parentArgs": []
  },
  {
    "id": "vehicle_imports/component_mappings",
    "command": "vehicle_imports component_mappings",
    "segments": [
      "vehicle_imports",
      "component_mappings"
    ],
    "label": "vehicle imports component mappings",
    "parentArgs": [
      {
        "name": "vehicle_import_uuid",
        "description": "vehicle imports UUID"
      }
    ]
  },
  {
    "id": "vehicle_imports/model_mappings",
    "command": "vehicle_imports model_mappings",
    "segments": [
      "vehicle_imports",
      "model_mappings"
    ],
    "label": "vehicle imports model mappings",
    "parentArgs": [
      {
        "name": "vehicle_import_uuid",
        "description": "vehicle imports UUID"
      }
    ]
  },
  {
    "id": "vehicle_imports/rows",
    "command": "vehicle_imports rows",
    "segments": [
      "vehicle_imports",
      "rows"
    ],
    "label": "vehicle imports rows",
    "parentArgs": [
      {
        "name": "vehicle_import_uuid",
        "description": "vehicle imports UUID"
      }
    ]
  },
  {
    "id": "vehicles",
    "command": "vehicles",
    "segments": [
      "vehicles"
    ],
    "label": "vehicles",
    "parentArgs": []
  },
  {
    "id": "vehicles/components",
    "command": "vehicles components",
    "segments": [
      "vehicles",
      "components"
    ],
    "label": "vehicles components",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/components/fault_codes",
    "command": "vehicles components fault_codes",
    "segments": [
      "vehicles",
      "components",
      "fault_codes"
    ],
    "label": "vehicles components fault codes",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      },
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "vehicles/components/metadata",
    "command": "vehicles components metadata",
    "segments": [
      "vehicles",
      "components",
      "metadata"
    ],
    "label": "vehicles components metadata",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      },
      {
        "name": "component_uuid",
        "description": "components UUID"
      }
    ]
  },
  {
    "id": "vehicles/customer_invitations",
    "command": "vehicles customer_invitations",
    "segments": [
      "vehicles",
      "customer_invitations"
    ],
    "label": "vehicles customer invitations",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/customers",
    "command": "vehicles customers",
    "segments": [
      "vehicles",
      "customers"
    ],
    "label": "vehicles customers",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/diagnostics",
    "command": "vehicles diagnostics",
    "segments": [
      "vehicles",
      "diagnostics"
    ],
    "label": "vehicles diagnostics",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/diagnostics/steps",
    "command": "vehicles diagnostics steps",
    "segments": [
      "vehicles",
      "diagnostics",
      "steps"
    ],
    "label": "vehicles diagnostics steps",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      },
      {
        "name": "diagnostic_uuid",
        "description": "diagnostics UUID"
      }
    ]
  },
  {
    "id": "vehicles/events",
    "command": "vehicles events",
    "segments": [
      "vehicles",
      "events"
    ],
    "label": "vehicles events",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/fault_codes",
    "command": "vehicles fault_codes",
    "segments": [
      "vehicles",
      "fault_codes"
    ],
    "label": "vehicles fault codes",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/iot_command_queue",
    "command": "vehicles iot_command_queue",
    "segments": [
      "vehicles",
      "iot_command_queue"
    ],
    "label": "vehicles iot command queue",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/maintenance_history",
    "command": "vehicles maintenance_history",
    "segments": [
      "vehicles",
      "maintenance_history"
    ],
    "label": "vehicles maintenance history",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/metadata",
    "command": "vehicles metadata",
    "segments": [
      "vehicles",
      "metadata"
    ],
    "label": "vehicles metadata",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/ownership_requests",
    "command": "vehicles ownership_requests",
    "segments": [
      "vehicles",
      "ownership_requests"
    ],
    "label": "vehicles ownership requests",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/recalls",
    "command": "vehicles recalls",
    "segments": [
      "vehicles",
      "recalls"
    ],
    "label": "vehicles recalls",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/subscriptions",
    "command": "vehicles subscriptions",
    "segments": [
      "vehicles",
      "subscriptions"
    ],
    "label": "vehicles subscriptions",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/subscriptions/events",
    "command": "vehicles subscriptions events",
    "segments": [
      "vehicles",
      "subscriptions",
      "events"
    ],
    "label": "vehicles subscriptions events",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      },
      {
        "name": "subscription_uuid",
        "description": "subscriptions UUID"
      }
    ]
  },
  {
    "id": "vehicles/timestream",
    "command": "vehicles timestream",
    "segments": [
      "vehicles",
      "timestream"
    ],
    "label": "vehicles timestream",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/track",
    "command": "vehicles track",
    "segments": [
      "vehicles",
      "track"
    ],
    "label": "vehicles track",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "vehicles/warranty_violations",
    "command": "vehicles warranty_violations",
    "segments": [
      "vehicles",
      "warranty_violations"
    ],
    "label": "vehicles warranty violations",
    "parentArgs": [
      {
        "name": "vehicle_uuid",
        "description": "vehicles UUID"
      }
    ]
  },
  {
    "id": "warranty_profiles",
    "command": "warranty_profiles",
    "segments": [
      "warranty_profiles"
    ],
    "label": "warranty profiles",
    "parentArgs": []
  }
]
)

export const resourcesById = Object.freeze(Object.fromEntries(resources.map((resource) => [resource.id, resource])))

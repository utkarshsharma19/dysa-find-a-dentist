variable "project_id" {
  type = string
}

variable "environment" {
  type = string
}

locals {
  secrets = [
    "database-url",
    "session-secret",
    "kms-key-id",
    "sms-provider-key",
    "email-provider-key",
  ]
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(local.secrets)
  secret_id = "dysa-${var.environment}-${each.key}"

  replication {
    auto {}
  }

  labels = {
    environment = var.environment
    app         = "dysa"
  }
}

output "secret_ids" {
  value = { for k, v in google_secret_manager_secret.secrets : k => v.secret_id }
}

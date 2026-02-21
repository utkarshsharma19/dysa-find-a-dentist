variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "environment" {
  type = string
}

variable "db_tier" {
  type    = string
  default = "db-custom-1-3840"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "private_vpc_connection" {
  type = string
}

resource "google_sql_database_instance" "postgres" {
  name             = "dysa-${var.environment}-db"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = var.db_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_size         = 20
    disk_autoresize   = true

    database_flags {
      name  = "cloudsql.enable_pg_cron"
      value = "on"
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.private_vpc_connection
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "prod"
      start_time                     = "03:00"
    }

    maintenance_window {
      day  = 7
      hour = 4
    }
  }

  deletion_protection = var.environment == "prod"
}

resource "google_sql_database" "app" {
  name     = "dysa_dental"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "app" {
  name     = "dysa_app"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Enable PostGIS via SQL — run after DB creation
# Note: PostGIS must be enabled via psql or migration: CREATE EXTENSION IF NOT EXISTS postgis;

output "connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "private_ip" {
  value = google_sql_database_instance.postgres.private_ip_address
}

module "networking" {
  source      = "../../modules/networking"
  project_id  = var.project_id
  region      = var.region
  environment = "staging"
}

module "database" {
  source                 = "../../modules/database"
  project_id             = var.project_id
  region                 = var.region
  environment            = "staging"
  db_tier                = "db-custom-1-3840"
  db_password            = var.db_password
  private_vpc_connection = module.networking.private_vpc_connection
}

module "secrets" {
  source      = "../../modules/secrets"
  project_id  = var.project_id
  environment = "staging"
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east4"
}

variable "db_password" {
  type      = string
  sensitive = true
}

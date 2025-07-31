
#Creation of s3 bucket
#Ensure provider is created in provider.tf
///resource "aws_s3_bucket" "bucket_test1" {
///   bucket = "ce10project2-s3-bucket"
///   force_destroy = true}


#Creation of VPC
#Ensure terraform required_providers is created in provider.tf
module "vpc" {
    source = "terraform-aws-modules/vpc/aws"
    name   = "ce10Project2-vpc"
    cidr = "10.0.0.0/16"
    azs = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]
    private_subnets = ["10.0.1.0/24","10.0.2.0/24","10.0.3.0/24"]
    public_subnets = ["10.0.101.0/24","10.0.102.0/24","10.0.103.0/24"]
    
    enable_nat_gateway = true

    tags = {
        Terraform = "true"
        environment = "dev"
        owner = "zh"
    }

}

#Creation of key-pair
resource "tls_private_key" "ec2_key" {
    algorithm = "RSA"
    rsa_bits = "4096"
}


resource "aws_key_pair" "generated_key" {
    key_name = "ce10Project2-key"
    public_key = tls_private_key.ec2_key.public_key_openssh
}

resource "local_file" "private_key_pem" {
    content = tls_private_key.ec2_key.private_key_pem
    filename = "${path.module}/ce10Project2-key.pem"              #Basically path.module is the filepath of where this .tf is stored
    file_permission = "0400"
}



#Creation of EC2 instance
#Also need to ensure security group is created 
resource "aws_instance" "public" {
    ami                         = "ami-015927f8ee1bc0293"
    instance_type               = "t2.micro"
    subnet_id                   = module.vpc.private_subnets[1]        #use [0,1,2] if just want to hard code to specific subnets
    associate_public_ip_address = true
    key_name                    = aws_key_pair.generated_key.key_name
    vpc_security_group_ids      = [aws_security_group.allow_ssh.id]

    tags = {
        name = "ce10Project2-ec2"
    }
}

#Creation of Security group 
resource "aws_security_group" "allow_ssh" {
    name = "ce10Project2-security-group1"
    description = "Allow SSH inbound"
    vpc_id = module.vpc.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "allow_tls_ipv4" {
    security_group_id = aws_security_group.allow_ssh.id
    cidr_ipv4 = "0.0.0.0/0"
    from_port = 22
    ip_protocol =  "tcp"
    to_port = 22
}
